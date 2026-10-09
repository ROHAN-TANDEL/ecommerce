import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, Subject, tap } from 'rxjs';
import {
  TableConfigPayload,
  ColumnConfigMap,
  ActionPanelConfigPayload,
  HeaderConfigPayload,
  RowActionsConfigPayload,
  ColumnOptionsConfigPayload,
  PaginationState,
  SavedTableView,
  LiveTableEvent,
  TableUserPresence,
} from './employees.types';

@Injectable({
  providedIn: 'root',
})
export class EmployeesApiService {
  private readonly http = inject(HttpClient);
  private readonly defaultBaseUrl = 'http://localhost:3000';

  // ══════════════════════════════════════════════════════════════════════
  // SHARED REACTIVE BUS (Synchronizes Backend-Level Actions Across Tables)
  // ══════════════════════════════════════════════════════════════════════
  readonly dataChanged$ = new Subject<void>();
  readonly viewsChanged$ = new Subject<void>();

  // ══════════════════════════════════════════════════════════════════════
  // LIVE BROADCAST BUS & MULTI-USER PRESENCE TRACKING (Redis Pub/Sub backed)
  // ══════════════════════════════════════════════════════════════════════
  readonly liveEvents$ = new Subject<LiveTableEvent>();
  readonly userPresence$ = new Subject<TableUserPresence>();

  private presences = new Map<string, TableUserPresence>();
  private activeEventSources = new Map<string, EventSource>();

  notifyDataChanged(): void {
    this.dataChanged$.next();
  }

  notifyViewsChanged(): void {
    this.viewsChanged$.next();
  }

  /**
   * Connect to backend Redis Pub/Sub via Server-Sent Events (SSE)
   */
  connectRedisLiveFeed(tableKey = 'users_table_1234', baseUrl = this.defaultBaseUrl): void {
    if (this.activeEventSources.has(tableKey)) {
      return; // Already connected
    }

    const sseUrl = `${this.resolveUrl('/identity/management/listen/users', baseUrl)}?table_key=${encodeURIComponent(tableKey)}`;
    try {
      const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log(`[EmployeesApiService] Connected to Redis Pub/Sub SSE feed for table: ${tableKey}`);
      };

      eventSource.onmessage = (messageEvent) => {
        try {
          if (!messageEvent.data || messageEvent.data === ': heartbeat') return;
          const payload = JSON.parse(messageEvent.data);

          if (payload.type === 'CONNECTED' || payload.type === 'ERROR') {
            return;
          }

          // Handle Presence sync from Redis
          if (payload.presence) {
            const pres: TableUserPresence = {
              ...payload.presence,
              lastActive: new Date(payload.presence.lastActive || Date.now()),
            };
            this.presences.set(pres.instanceId, pres);
            this.userPresence$.next(pres);
            return;
          }

          // Handle Live Table Event from Redis
          if (payload.actionType && payload.sourceInstanceId) {
            const liveEvt: LiveTableEvent = {
              ...payload,
              id: payload.id || `live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              timestamp: new Date(payload.timestamp || Date.now()),
            };
            this.liveEvents$.next(liveEvt);
          }
        } catch (err) {
          console.warn('[EmployeesApiService] Failed to parse Redis SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn(`[EmployeesApiService] SSE connection issue on table ${tableKey}, browser will auto-reconnect`, err);
      };

      this.activeEventSources.set(tableKey, eventSource);
    } catch (e) {
      console.warn('[EmployeesApiService] Could not initialize EventSource for Redis live feed', e);
    }
  }

  disconnectRedisLiveFeed(tableKey = 'users_table_1234'): void {
    const source = this.activeEventSources.get(tableKey);
    if (source) {
      source.close();
      this.activeEventSources.delete(tableKey);
    }
  }

  /**
   * Broadcast an event to Redis Pub/Sub backend & local reactive bus
   */
  broadcastLiveEvent(
    event: Omit<LiveTableEvent, 'id' | 'timestamp'>,
    baseUrl = this.defaultBaseUrl
  ): void {
    const fullEvent: LiveTableEvent = {
      ...event,
      id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
    };

    // 1. Immediately emit locally for zero-latency local UI responsiveness
    this.liveEvents$.next(fullEvent);

    // 2. Publish to backend Redis Pub/Sub so all users / browsers receive it
    const talkUrl = this.resolveUrl('/identity/management/talk/users', baseUrl);
    this.http.post(talkUrl, {
      table_key: event.tableKey || 'users_table_1234',
      ...fullEvent,
      timestamp: fullEvent.timestamp.toISOString(),
    }).pipe(
      catchError(err => {
        // Fallback: If backend is offline or network fails, local reactive bus already handled it
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Broadcast presence update to Redis Pub/Sub backend & local reactive bus
   */
  updatePresence(
    presence: TableUserPresence,
    tableKey = 'users_table_1234',
    baseUrl = this.defaultBaseUrl
  ): void {
    this.presences.set(presence.instanceId, { ...presence });
    this.userPresence$.next({ ...presence });

    const talkUrl = this.resolveUrl('/identity/management/talk/users', baseUrl);
    this.http.post(talkUrl, {
      table_key: tableKey,
      presence: {
        ...presence,
        lastActive: presence.lastActive.toISOString(),
      },
    }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  getAllPresences(): TableUserPresence[] {
    return Array.from(this.presences.values());
  }

  // ══════════════════════════════════════════════════════════════════════
  // SHARED PERSISTENT MOCK DATA (Single source of truth for offline mode)
  // ══════════════════════════════════════════════════════════════════════
  private sharedMockRows: Record<string, any>[] = [
    { id: '1', first_name: 'Liam', last_name: 'Walker', email: 'liam.walker@enterprise.io', status: 'active', created_at: '2026-09-12 10:45 AM' },
    { id: '2', first_name: 'Olivia', last_name: 'Brooks', email: 'olivia.brooks@enterprise.io', status: 'pending', created_at: '2026-09-14 02:18 PM' },
    { id: '3', first_name: 'Ethan', last_name: 'Hayes', email: 'ethan.hayes@enterprise.io', status: 'active', created_at: '2026-09-16 11:30 AM' },
    { id: '4', first_name: 'Sophia', last_name: 'Bennett', email: 'sophia.bennett@enterprise.io', status: 'inactive', created_at: '2026-09-18 09:12 AM', editable: false },
    { id: '5', first_name: 'Noah', last_name: 'Carter', email: 'noah.carter@enterprise.io', status: 'active', created_at: '2026-09-20 04:55 PM' },
    { id: '6', first_name: 'Ava', last_name: 'Mitchell', email: 'ava.mitchell@enterprise.io', status: 'pending', created_at: '2026-09-22 01:20 PM', disabled: true },
    { id: '7', first_name: 'Lucas', last_name: 'Sullivan', email: 'lucas.sullivan@enterprise.io', status: 'active', created_at: '2026-09-24 08:40 AM' },
    { id: '8', first_name: 'Mia', last_name: 'Reynolds', email: 'mia.reynolds@enterprise.io', status: 'inactive', created_at: '2026-09-26 03:15 PM' },
  ];

  private sharedMockViews: SavedTableView[] = [];

  getMockRows(): Record<string, any>[] {
    return [...this.sharedMockRows];
  }

  addMockRow(row: Record<string, any>): void {
    this.sharedMockRows.unshift(row);
  }

  updateMockRow(id: string | number, data: Partial<Record<string, any>>): void {
    const strId = String(id);
    const existing = this.sharedMockRows.find(r => String(r['id']) === strId);
    if (existing) {
      Object.assign(existing, data);
    }
  }

  deleteMockRow(id: string | number): void {
    const strId = String(id);
    this.sharedMockRows = this.sharedMockRows.filter(r => String(r['id']) !== strId);
  }

  deleteMockRows(ids: (string | number)[]): void {
    const set = new Set(ids.map(String));
    this.sharedMockRows = this.sharedMockRows.filter(r => !set.has(String(r['id'])));
  }

  bulkUpdateMockRows(rows: Record<string, any>[]): void {
    rows.forEach(r => {
      this.updateMockRow(r['id'], r);
    });
  }

  getMockSavedViews(): SavedTableView[] {
    return [...this.sharedMockViews];
  }

  saveMockView(payload: any): SavedTableView {
    const id = payload.id || `view_${Date.now()}`;
    const newView: SavedTableView = {
      id,
      table_key: payload.table_key || 'users_table_1234',
      name: payload.name,
      is_default: !!payload.is_default,
      view_state: payload.view_state,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const existingIdx = this.sharedMockViews.findIndex(v => String(v.id) === String(id) || v.name === payload.name);
    if (existingIdx !== -1) {
      this.sharedMockViews[existingIdx] = newView;
    } else {
      this.sharedMockViews.push(newView);
    }
    return newView;
  }

  deleteMockView(id: string | number): void {
    const strId = String(id);
    this.sharedMockViews = this.sharedMockViews.filter(v => String(v.id) !== strId && v.name !== strId);
  }

  /**
   * Resolves relative paths (/identity/management/users) or absolute URLs
   */
  resolveUrl(pathOrUrl: string, baseUrl = this.defaultBaseUrl): string {
    if (!pathOrUrl) return '';
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${cleanBase}${cleanPath}`;
  }

  /**
   * Resolve base API route for any table key or route path.
   * Examples:
   *  'users_table_1234' -> '/identity/management/users'
   *  'customers_table_1234' -> '/identity/management/customers'
   *  'employees_table_1234' -> '/identity/management/employees'
   *  '/identity/management/invoices' -> '/identity/management/invoices'
   */
  resolveEntityPath(tableKeyOrPath: string = 'users_table_1234'): string {
    if (!tableKeyOrPath) return '/identity/management/users';
    if (tableKeyOrPath.startsWith('/')) return tableKeyOrPath.replace(/\/+$/, '');

    // Normalize string: e.g. 'users_table_1234' -> 'users'
    const clean = tableKeyOrPath.toLowerCase()
      .replace(/_table(_\w+)?$/, '')
      .replace(/_unique_key$/, '');

    // Determine plural resource name
    let plural = clean;
    if (!plural.endsWith('s')) {
      if (plural.endsWith('y')) plural = plural.slice(0, -1) + 'ies';
      else plural = plural + 's';
    }
    return `/identity/management/${plural}`;
  }

  /**
   * Fetch Table Config from /identity/management/:entity/config/table
   */
  fetchTableConfig(tableKeyOrPath = 'users_table_1234', baseUrl = this.defaultBaseUrl): Observable<TableConfigPayload> {
    const basePath = this.resolveEntityPath(tableKeyOrPath);
    const url = this.resolveUrl(`${basePath}/config/table`, baseUrl);
    return this.http.get<any>(url).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Fetch Columns Config from /identity/management/:entity/config/columns
   */
  fetchColumnsConfig(tableKeyOrPath = 'users_table_1234', baseUrl = this.defaultBaseUrl): Observable<{ columns: ColumnConfigMap; options?: ColumnOptionsConfigPayload }> {
    const basePath = this.resolveEntityPath(tableKeyOrPath);
    const url = this.resolveUrl(`${basePath}/config/columns`, baseUrl);
    return this.http.get<any>(url).pipe(
      map(res => {
        const data = res?.data || res;
        if (data && data.columns) {
          return { columns: data.columns as ColumnConfigMap, options: data.options as ColumnOptionsConfigPayload };
        }
        return { columns: data as ColumnConfigMap, options: undefined };
      })
    );
  }

  /**
   * Fetch Actions Config from /identity/management/:entity/config/actions
   */
  fetchActionsConfig(tableKeyOrPath = 'users_table_1234', baseUrl = this.defaultBaseUrl): Observable<ActionPanelConfigPayload> {
    const basePath = this.resolveEntityPath(tableKeyOrPath);
    const url = this.resolveUrl(`${basePath}/config/actions`, baseUrl);
    return this.http.get<any>(url).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Fetch Header Config from /identity/management/:entity/config/header
   */
  fetchHeaderConfig(tableKeyOrPath = 'users_table_1234', baseUrl = this.defaultBaseUrl): Observable<HeaderConfigPayload> {
    const basePath = this.resolveEntityPath(tableKeyOrPath);
    const url = this.resolveUrl(`${basePath}/config/header`, baseUrl);
    return this.http.get<any>(url).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Fetch Row Actions Config from /identity/management/:entity/config/row-actions
   */
  fetchRowActionsConfig(tableKeyOrPath = 'users_table_1234', baseUrl = this.defaultBaseUrl): Observable<RowActionsConfigPayload> {
    const basePath = this.resolveEntityPath(tableKeyOrPath);
    const url = this.resolveUrl(`${basePath}/config/row-actions`, baseUrl);
    return this.http.get<any>(url).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Loads all configurations in parallel for any tableKeyOrPath
   */
  bootstrap(baseUrl = this.defaultBaseUrl, tableKeyOrPath = 'users_table_1234'): Observable<{
    tableConfig: TableConfigPayload;
    columnsConfig: ColumnConfigMap;
    columnOptionsConfig?: ColumnOptionsConfigPayload;
    actionsConfig: ActionPanelConfigPayload;
    headerConfig?: HeaderConfigPayload;
    rowActionsConfig?: RowActionsConfigPayload;
    isLive: boolean;
  }> {
    const basePath = this.resolveEntityPath(tableKeyOrPath);
    return forkJoin({
      tableConfig: this.fetchTableConfig(basePath, baseUrl).pipe(catchError(() => of(null as any))),
      columnsData: this.fetchColumnsConfig(basePath, baseUrl).pipe(catchError(() => of(null as any))),
      actionsConfig: this.fetchActionsConfig(basePath, baseUrl).pipe(catchError(() => of(null as any))),
      headerConfig: this.fetchHeaderConfig(basePath, baseUrl).pipe(catchError(() => of(null as any))),
      rowActionsConfig: this.fetchRowActionsConfig(basePath, baseUrl).pipe(catchError(() => of(null as any))),
    }).pipe(
      map(res => {
        const isLive = !!(res.tableConfig && res.columnsData);
        return {
          tableConfig: res.tableConfig,
          columnsConfig: res.columnsData?.columns || (res.columnsData as any),
          columnOptionsConfig: res.columnsData?.options,
          actionsConfig: res.actionsConfig,
          headerConfig: res.headerConfig,
          rowActionsConfig: res.rowActionsConfig,
          isLive,
        };
      }),
      catchError(err => {
        console.warn('[EmployeesApiService] Backend API unreachable on :3000, using local configuration fallback.', err);
        return of({
          tableConfig: null as any,
          columnsConfig: null as any,
          columnOptionsConfig: undefined,
          actionsConfig: null as any,
          headerConfig: null as any,
          rowActionsConfig: null as any,
          isLive: false,
        });
      })
    );
  }

  /**
   * Fetch Paginated Data from paginated_data_api
   */
  fetchPaginatedData(
    apiUrl: string,
    page: number,
    limit: number,
    filters: Record<string, any> = {},
    sortKey?: string,
    sortOrder?: 'asc' | 'desc' | null,
    baseUrl = this.defaultBaseUrl
  ): Observable<{ rows: any[]; pagination: PaginationState; isLive: boolean }> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (sortKey && sortOrder) {
      params = params
        .set('sort', JSON.stringify({ [sortKey]: sortOrder }))
        .set('order', sortOrder);
    }

    if (filters && Object.keys(filters).length > 0) {
      params = params.set('filters', JSON.stringify(filters));
      Object.keys(filters).forEach(key => {
        const val = filters[key];
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      });
    }

    return this.http.get<any>(fullUrl, { params }).pipe(
      map(response => {
        const rows =
          response?.user ??
          response?.data ??
          response?.rows ??
          (Array.isArray(response) ? response : []);

        const pagination: PaginationState = response?.pagination ?? {
          page,
          limit,
          total: rows.length,
          totalPages: Math.max(1, Math.ceil(rows.length / limit)),
        };

        return { rows, pagination, isLive: true };
      }),
      catchError(err => {
        console.warn(`[EmployeesApiService] Failed to fetch data from ${fullUrl}:`, err);
        return of({
          rows: [] as any[],
          pagination: { page, limit, total: 0, totalPages: 1 },
          isLive: false,
        });
      })
    );
  }

  /**
   * Fetch single user details via data_api (replaces :id)
   */
  fetchUser(
    apiTemplate: string,
    id: string | number,
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const resolvedPath = apiTemplate.replace(':id', String(id));
    const fullUrl = this.resolveUrl(resolvedPath, baseUrl);
    return this.http.get<any>(fullUrl);
  }

  /**
   * Create User via create_api
   */
  createUser(apiUrl: string, body: any, baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.post<any>(fullUrl, body).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Batch create multiple users via create_all_api / create_bulk_api
   */
  createAllUsers(apiUrl: string, users: any[], baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.post<any>(fullUrl, users).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Import users from Excel / CSV file via create_import_api
   */
  importCreateUsers(
    apiUrl: string,
    file: File,
    options: { skip_duplicates?: boolean; notify_users?: boolean } = { skip_duplicates: true, notify_users: false },
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('options', JSON.stringify({ options }));
    return this.http.post<any>(fullUrl, formData).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Import user updates from Excel / CSV file via update_import_api
   */
  importUpdateUsers(
    apiUrl: string,
    file: File,
    identifierKey = 'email',
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('identifier_key', identifierKey);
    return this.http.post<any>(fullUrl, formData).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Rule 3: Single User Update via update_api (replaces :id)
   * Method: PUT /identity/management/users/update/:id
   */
  updateUser(
    apiTemplate: string,
    id: string | number,
    body: any,
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const resolvedPath = apiTemplate.replace(':id', String(id));
    const fullUrl = this.resolveUrl(resolvedPath, baseUrl);
    return this.http.put<any>(fullUrl, body).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Rule 2: Multiple Individual Rows Update via update_all_api
   * Method: POST /identity/management/users/update/all
   * Payload: [{ id: number, ...updatedFields }]
   */
  updateAllUsers(apiUrl: string, rows: any[], baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.post<any>(fullUrl, rows).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Rule 1: Master Checkbox Level Bulk Update via update_bulk_api
   * Method: POST /identity/management/users/update/bulk
   * Payload: { data: Record<string, any>, filters?: {}, excluded?: number[], sorts?: [] }
   */
  updateBulkUsers(
    apiUrl: string,
    payload: {
      data: Record<string, any>;
      filters?: Record<string, any>;
      excluded?: (string | number)[];
      sorts?: any[];
    },
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    const body = {
      data: payload?.data || {},
      filters: payload?.filters || {},
      excluded: (payload?.excluded || []).map(Number).filter(n => !isNaN(n)),
      sorts: payload?.sorts || [],
    };
    return this.http.post<any>(fullUrl, body).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Rule 3: Single User Delete via delete_api (replaces :id)
   * Method: DELETE /identity/management/users/delete/:id
   */
  deleteUser(
    apiTemplate: string,
    id: string | number,
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const resolvedPath = apiTemplate.replace(':id', String(id));
    const fullUrl = this.resolveUrl(resolvedPath, baseUrl);
    return this.http.delete<any>(fullUrl).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Rule 2: Multiple Individual Rows Delete via delete_all_api
   * Method: DELETE /identity/management/users/delete/all
   * Payload: { ids: number[] }
   */
  deleteAllUsers(apiUrl: string, ids: (string | number)[], baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    const numericIds = ids.map(Number).filter(n => !isNaN(n));
    return this.http.delete<any>(fullUrl, { body: { ids: numericIds } }).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Rule 1: Master Checkbox Level Bulk Delete via delete_bulk_api
   * Method: DELETE /identity/management/users/delete/bulk
   * Payload: { filters?: {}, excluded?: number[], sorts?: [] }
   */
  deleteBulkUsers(
    apiUrl: string,
    payload: {
      filters?: Record<string, any>;
      excluded?: (string | number)[];
      sorts?: any[];
    },
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    const body = {
      filters: payload?.filters || {},
      excluded: (payload?.excluded || []).map(Number).filter(n => !isNaN(n)),
      sorts: payload?.sorts || [],
    };
    return this.http.delete<any>(fullUrl, { body }).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Fetch Saved Views via list_view_api
   */
  fetchSavedViews(
    apiUrl: string,
    tableKey = 'users_table_1234',
    baseUrl = this.defaultBaseUrl
  ): Observable<any[]> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    const params = new HttpParams().set('table_key', tableKey);
    return this.http.get<any>(fullUrl, { params }).pipe(
      map(res => {
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        return Array.isArray(list) ? list : [];
      }),
      catchError(err => {
        console.warn(`[EmployeesApiService] Failed to fetch saved views from ${fullUrl}:`, err);
        return of([]);
      })
    );
  }

  /**
   * Save View via save_view_api
   */
  saveView(apiUrl: string, payload: any, baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.post<any>(fullUrl, payload).pipe(
      tap(() => this.notifyViewsChanged())
    );
  }

  /**
   * Delete View via delete_view_api
   */
  deleteView(
    apiTemplate: string,
    id: string | number,
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const resolvedPath = apiTemplate.includes(':id')
      ? apiTemplate.replace(':id', String(id))
      : `${apiTemplate.replace(/\/+$/, '')}/${id}`;
    const fullUrl = this.resolveUrl(resolvedPath, baseUrl);
    return this.http.delete<any>(fullUrl).pipe(
      tap(() => this.notifyViewsChanged())
    );
  }

  /**
   * AI Summary: Fetch overview summary of table or selected rows
   * Method: POST /identity/management/users/ai/summary
   */
  fetchAiSummary(
    apiUrl: string,
    payload: {
      mode?: string;
      row_ids?: (string | number)[];
      rows_sample?: any[];
      filters?: Record<string, any>;
      total_count?: number;
      selected_row_ids?: (string | number)[];
      selected_rows?: any[];
      active_filters?: Record<string, any>;
      table_key?: string;
      [key: string]: any;
    },
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.post<any>(fullUrl, payload).pipe(
      catchError(err => {
        console.warn(`[EmployeesApiService] Live AI Summary failed (${err.status || 'offline'}), generating client summary:`, err);
        const isSelected = (payload.selected_row_ids && payload.selected_row_ids.length > 0) || (payload.row_ids && payload.row_ids.length > 0);
        const rowsToSummarize = (payload.selected_rows && payload.selected_rows.length > 0)
          ? payload.selected_rows
          : (payload.rows_sample && payload.rows_sample.length > 0 ? payload.rows_sample : this.sharedMockRows);

        const statusCounts: Record<string, number> = { active: 0, inactive: 0, pending: 0 };
        const names: string[] = [];
        const emails: string[] = [];

        rowsToSummarize.forEach((r: any) => {
          const st = String(r.status || 'active').toLowerCase();
          statusCounts[st] = (statusCounts[st] || 0) + 1;
          const name = `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email || `User #${r.id}`;
          names.push(name);
          if (r.email) emails.push(r.email);
        });

        const count = rowsToSummarize.length;
        const statusText = Object.entries(statusCounts)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${v} ${k}`)
          .join(', ');

        const summaryData = isSelected
          ? {
              type: 'row_summary',
              title: `Selected Rows Summary (${count} User${count > 1 ? 's' : ''})`,
              summary: `You have selected ${count} record(s): ${names.slice(0, 3).join(', ')}${names.length > 3 ? ` and ${names.length - 3} more` : ''}. Status breakdown: ${statusText || 'None'}.`,
              highlights: [
                `Selected user records: ${names.join(', ')}`,
                `Status breakdown: ${statusText || 'N/A'}`,
                emails.length > 0 ? `Associated emails: ${emails.slice(0, 5).join(', ')}` : null
              ].filter(Boolean),
              stats: {
                selected_count: count,
                status_counts: statusCounts,
                selected_ids: payload.selected_row_ids || payload.row_ids || []
              },
              generated_at: new Date().toISOString()
            }
          : {
              type: 'table_summary',
              title: 'User Management Table Overview',
              summary: `This table manages core identity records, employee accounts, access permissions, and authentication baselines across the platform. Total records: ${payload.total_count || this.sharedMockRows.length}.`,
              highlights: [
                `Total users: ${payload.total_count || this.sharedMockRows.length}`,
                `Status breakdown: ${statusCounts['active'] || 0} active, ${statusCounts['pending'] || 0} pending, ${statusCounts['inactive'] || 0} inactive`,
                payload.active_filters && Object.keys(payload.active_filters).length > 0
                  ? `Active filters: ${Object.keys(payload.active_filters).join(', ')}`
                  : 'Displaying unfiltered dataset'
              ],
              stats: {
                total_users: payload.total_count || this.sharedMockRows.length,
                status_counts: statusCounts,
                active_filters: payload.active_filters || {}
              },
              generated_at: new Date().toISOString()
            };

        return of({
          status: 'success',
          code: 200,
          message: 'AI summary generated successfully',
          data: summaryData
        });
      })
    );
  }

  /**
   * Interact with Table using AI
   * Method: POST /identity/management/users/ai/interact
   */
  interactWithAi(
    apiUrl: string,
    payload: {
      query: string;
      columns?: any[];
      current_rows?: any[];
      selected_row_ids?: (string | number)[];
      active_filters?: Record<string, any>;
      table_key?: string;
      [key: string]: any;
    },
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.post<any>(fullUrl, payload).pipe(
      catchError(err => {
        console.warn(`[EmployeesApiService] Live AI Interact failed (${err.status || 'offline'}), processing locally:`, err);
        const query = (payload.query || '').toLowerCase();
        let reply = '';
        let intent = 'general';
        const actions: any = {
          filters: { set: {}, remove: [] },
          proposed_edits: [],
          generated_rows: [],
          requires_user_review: false
        };

        const isFilterRemove = query.includes('remove filter') || query.includes('clear filter') || query.includes('reset filter') || query.includes('show all');
        const isFilterAdd = query.includes('filter') || query.includes('show only') || query.includes('find') || query.includes('search');

        if (isFilterRemove) {
          intent = 'filter_remove';
          actions.filters.remove_all = true;
          reply = 'I have cleared all table filters so you can see all records.';
        } else if (isFilterAdd) {
          intent = 'filter_add';
          if (query.includes('active')) {
            actions.filters.set['status'] = ['active'];
            reply = 'Filtered table to show only active users.';
          } else if (query.includes('inactive')) {
            actions.filters.set['status'] = ['inactive'];
            reply = 'Filtered table to show only inactive users.';
          } else if (query.includes('pending')) {
            actions.filters.set['status'] = ['pending'];
            reply = 'Filtered table to show only pending users.';
          } else {
            const matchName = query.match(/(?:for|named|user|name)\s+([a-zA-Z]+)/);
            if (matchName && matchName[1]) {
              const nameTerm = matchName[1];
              actions.filters.set['first_name'] = [nameTerm];
              reply = `Filtered table for first name matching "${nameTerm}".`;
            } else {
              reply = "Understood. Please specify the column or value you wish to filter by (e.g. 'filter active users').";
            }
          }
        }

        const isGenerate = query.includes('generate') || query.includes('add random') || query.includes('create test') || query.includes('sample user') || query.includes('dummy user') || query.includes('fake user');
        if (isGenerate) {
          intent = 'generate';
          const numMatch = query.match(/\b([1-9]|10)\b/);
          let count = numMatch ? parseInt(numMatch[1], 10) : 3;
          if (count > 5) count = 5;
          if (count < 1) count = 1;

          const firstNames = ['Liam', 'Sophia', 'Ethan', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Mia', 'Jackson', 'Emma'];
          const lastNames = ['Vance', 'Sterling', 'Hayes', 'Brooks', 'Sinclair', 'Bennett', 'Reynolds', 'Sullivan', 'Carter', 'Morgan'];
          const domains = ['enterprise.io', 'techcorp.com', 'acme.org'];

          const genRows: any[] = [];
          for (let i = 0; i < count; i++) {
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const domain = domains[Math.floor(Math.random() * domains.length)];
            const randSuffix = Math.floor(Math.random() * 900) + 100;
            const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randSuffix}@${domain}`;
            const targetStatus = query.includes('pending') ? 'pending' : (query.includes('inactive') ? 'inactive' : 'active');

            genRows.push({
              temp_id: `ai_gen_${Date.now()}_${i + 1}`,
              first_name: fn,
              last_name: ln,
              email: email,
              status: targetStatus,
              created_at: new Date().toLocaleDateString(),
              is_ai_generated: true,
              needs_review: true
            });
          }

          actions.generated_rows = genRows;
          actions.requires_user_review = true;
          reply = `Generated ${count} relative sample user record(s) matching your table schema. They have been added in draft mode and marked for review. Please review and accept them before saving.`;
        }

        const isEdit = query.includes('change') || query.includes('update') || query.includes('modify') || query.includes('set') || query.includes('make') || query.includes('capitalize');
        if (isEdit && !isGenerate) {
          intent = 'edit_proposal';
          const currentRows = payload.current_rows || [];
          const selectedIds = new Set((payload.selected_row_ids || []).map(String));
          const targetRows = selectedIds.size > 0
            ? currentRows.filter(r => selectedIds.has(String(r['id'])))
            : currentRows;

          if (query.includes('inactive') || query.includes('disable')) {
            targetRows.forEach(r => {
              actions.proposed_edits.push({
                row_id: r['id'],
                field: 'status',
                old_value: r['status'],
                new_value: 'inactive'
              });
            });
            reply = `Proposed setting status to 'inactive' for ${actions.proposed_edits.length} row(s). These are draft edits requiring your review.`;
          } else if (query.includes('active') || query.includes('enable')) {
            targetRows.forEach(r => {
              actions.proposed_edits.push({
                row_id: r['id'],
                field: 'status',
                old_value: r['status'],
                new_value: 'active'
              });
            });
            reply = `Proposed setting status to 'active' for ${actions.proposed_edits.length} row(s). These are draft edits requiring your review.`;
          } else {
            reply = `I can propose non-destructive edits for table data. Specify the change (e.g. 'set status to inactive for selected rows').`;
          }

          if (actions.proposed_edits.length > 0) {
            actions.requires_user_review = true;
          }
        }

        if (!reply) {
          reply = `I can help you filter records (e.g., 'filter active users', 'show all'), propose draft edits, or generate sample records (e.g., 'generate 3 test users').`;
        }

        return of({
          status: 'success',
          code: 200,
          message: 'AI Assistant processed query',
          data: {
            reply,
            intent,
            actions
          }
        });
      })
    );
  }
}
