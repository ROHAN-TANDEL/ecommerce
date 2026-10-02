import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';

import type { ColumnConfigResponse, ColumnConfigItem } from '../../components/data-table/models/column-config.model';
import type { TableConfigResponse, TableConfigEntry } from '../../components/data-table/models/table-config.model';
import type {
  ColumnDef, CellFormat, PaginationState, SortState, FilterValues,
} from '../../components/data-table/models/column-def.model';

// ──────────────────────────────────────────────────────────────────────
// Response shapes
// ──────────────────────────────────────────────────────────────────────

export interface DataPage {
  data: any[];
  pagination: PaginationState;
}

export interface TableBootstrap {
  columnConfig: ColumnConfigResponse;
  tableConfig: TableConfigEntry;
  columns: ColumnDef[];
}

export interface SaveResult {
  success: boolean;
  data?: any;
  error?: string;
}

// ──────────────────────────────────────────────────────────────────────
// Column format hints — map API field names to visual formats
// ──────────────────────────────────────────────────────────────────────

/** Fields that should render with the avatar+text format (primary + secondary) */
const AVATAR_KEYS = new Set(['customer_name', 'owner_name', 'name', 'contact_name', 'first_name']);

/** Fields that use the flag+text format */
const FLAG_KEYS = new Set(['country', 'country_name']);

/** Fields that use the status badge format */
const STATUS_KEYS = new Set(['status', 'risk_level', 'customer_type']);

/** Fields that are numeric */
const NUMBER_KEYS = new Set(['annual_revenue', 'employee_count', 'revenue', 'amount', 'total']);

/** Fields that are boolean */
const BOOL_KEYS = new Set(['is_active', 'editable', 'active']);

/** Fields that are dates */
const DATE_KEYS = new Set(['onboarding_date', 'created_at', 'updated_at', 'last_activity_at', 'date', 'last_login_at']);

/** Secondary key map — what field shows under the primary in avatar format */
const SECONDARY_KEY_MAP: Record<string, string> = {
  customer_name: 'email',
  owner_name: 'owner_email',
  name: 'email',
  first_name: 'email',
};

/** Default widths per field key */
const DEFAULT_WIDTHS: Record<string, string> = {
  customer_name: '220px',
  status: '120px',
  country: '150px',
  annual_revenue: '150px',
  employee_count: '120px',
  onboarding_date: '150px',
  risk_level: '110px',
  is_active: '90px',
  editable: '90px',
  industry: '140px',
};
const FALLBACK_WIDTH = '160px';

function resolveFormat(key: string): CellFormat {
  if (AVATAR_KEYS.has(key)) return 'avatar';
  if (FLAG_KEYS.has(key))   return 'flag';
  if (STATUS_KEYS.has(key)) return 'status';
  if (NUMBER_KEYS.has(key)) return 'number';
  if (BOOL_KEYS.has(key))   return 'boolean';
  if (DATE_KEYS.has(key))   return 'date';
  return 'text';
}

function resolveWidth(key: string): string {
  return DEFAULT_WIDTHS[key] ?? FALLBACK_WIDTH;
}

/**
 * TableApiService
 *
 * Centralises all HTTP communication for the data-table.
 * No component ever calls HttpClient directly — everything goes through here.
 *
 * Key responsibilities:
 *  1. bootstrap()     — parallel load of column-config + table-config + build ColumnDef[]
 *  2. loadData()      — fetch paginated, sorted, filtered row data
 *  3. saveRow()       — PATCH a single row's changed fields
 *  4. buildColumnDefs() — merge raw API config into ColumnDef[]
 */
@Injectable({ providedIn: 'root' })
export class TableApiService {
  private readonly http = inject(HttpClient);

  // ── Bootstrap ──────────────────────────────────────────────────────

  /**
   * Load column config + table config in parallel, build ColumnDef[].
   * Used once when the table mounts.
   */
  bootstrap(
    baseUrl: string,
    configPath: string,
    tableConfigPath: string,
  ): Observable<TableBootstrap> {
    return forkJoin({
      columnConfig: this.http.get<ColumnConfigResponse>(`${baseUrl}${configPath}`).pipe(
        catchError(() => of({} as ColumnConfigResponse))
      ),
      tableConfigRaw: this.http.get<TableConfigResponse>(`${baseUrl}${tableConfigPath}`).pipe(
        catchError(() => of({} as TableConfigResponse))
      ),
    }).pipe(
      map(({ columnConfig, tableConfigRaw }) => {
        const tableConfig = Object.values(tableConfigRaw)[0] ?? ({} as TableConfigEntry);
        const columns = this.buildColumnDefs(columnConfig, tableConfig);
        return { columnConfig, tableConfig, columns };
      })
    );
  }

  // ── Data loading ───────────────────────────────────────────────────

  /**
   * Load a page of row data.
   * dataKey — the property in the response that holds the rows array (default: 'data').
   *           Some APIs return { user: [...] } instead of { data: [...] }.
   * httpMethod — 'GET' (default). Some filter endpoints use POST.
   */
  loadData(
    baseUrl: string,
    dataPath: string,
    page: number,
    limit: number,
    sorts: SortState[],
    filters: FilterValues,
    dataKey = 'data',
  ): Observable<DataPage> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (sorts.length > 0) {
      params = params.set('sort', sorts[0].key).set('order', sorts[0].direction);
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue;
      if (Array.isArray(value)) {
        if (value.length > 0) params = params.set(key, value.join(','));
      } else {
        params = params.set(key, String(value));
      }
    }

    console.log(`${baseUrl}${dataPath}`);
    return this.http.get<any>(`${baseUrl}${dataPath}`, { params }).pipe(
      map(res => ({
        data: res[dataKey] ?? res['data'] ?? [],
        pagination: res['pagination'] ?? { page, limit, total: 0, totalPages: 0 },
      })),
      catchError(() => of({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } }))
    );
  }

  // ── Save ───────────────────────────────────────────────────────────

  /**
   * Save a single row — uses PUT or PATCH depending on the API.
   * updateApiTemplate e.g. '/users/update/:id'
   */
  saveRow(
    baseUrl: string,
    updateApiTemplate: string,
    rowId: string,
    changes: Record<string, any>,
    method: 'PATCH' | 'PUT' = 'PATCH',
  ): Observable<SaveResult> {
    const path = updateApiTemplate.replace(':id', rowId);
    const url = `${baseUrl}${path}`;
    const req$ = method === 'PUT'
      ? this.http.put<any>(url, changes)
      : this.http.patch<any>(url, changes);
    return req$.pipe(
      map(data => ({ success: true, data })),
      catchError(err => of({ success: false, error: err?.message ?? 'Save failed' }))
    );
  }

  /** POST a new resource */
  createRow(
    baseUrl: string,
    createPath: string,
    body: Record<string, any>,
  ): Observable<SaveResult> {
    return this.http.post<any>(`${baseUrl}${createPath}`, body).pipe(
      map(data => ({ success: true, data })),
      catchError(err => of({ success: false, error: err?.message ?? 'Create failed' }))
    );
  }

  // ── Column def builder ─────────────────────────────────────────────

  /**
   * Merge the raw API column config with default visual/layout values
   * to produce a fully typed ColumnDef[] ready for the table.
   *
   * The result is ordered by the API response key order (Object.entries preserves
   * insertion order from the JSON) so the API controls the default column order.
   */
  buildColumnDefs(
    config: ColumnConfigResponse,
    tableConfig: TableConfigEntry,
  ): ColumnDef[] {
    const freezeStart = tableConfig?.column_freeze?.start ?? 0;
    const freezeEnd = tableConfig?.column_freeze?.end ?? 0;
    const resizeEnabled = tableConfig?.column_resize?.enabled ?? true;

    const activeKeys = Object.keys(config).filter(key => config[key].active);
    const total = activeKeys.length;

    return activeKeys
      .map((key, idx): ColumnDef => {
        const cfg: ColumnConfigItem = config[key];
        const w = resolveWidth(key);
        const frozen =
          (freezeStart > 0 && idx < freezeStart) ||
          (freezeEnd > 0 && idx >= total - freezeEnd);
        const frozenSide: 'left' | 'right' | undefined =
          frozen
            ? (idx < freezeStart ? 'left' : 'right')
            : undefined;

        return {
          key,
          label: cfg.header_name,
          infoNote: cfg.info_note,
          width: w,
          minWidth: '80px',
          maxWidth: '400px',
          defaultWidth: w,
          format: resolveFormat(key),
          ellipsis: cfg.elipsis,
          secondaryKey: SECONDARY_KEY_MAP[key],
          prefix: NUMBER_KEYS.has(key) ? '' : undefined,
          decimals: NUMBER_KEYS.has(key) ? 2 : undefined,
          visible: cfg.show,
          sortable: cfg.sorting,
          filterable: cfg.filter_type !== 'none',
          editable: cfg.editable,
          resizable: resizeEnabled,
          frozen,
          frozenSide,
          required: false,
          masterEditAllow: cfg.master_edit_allow,
          filterType: cfg.filter_type,
          filterData: cfg.filter_data ?? [],
          order: idx,
        };
      });
  }
}
