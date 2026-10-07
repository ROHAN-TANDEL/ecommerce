import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import {
  TableConfigPayload,
  ColumnConfigMap,
  ActionPanelConfigPayload,
  PaginationState,
} from './employees.types';

@Injectable({
  providedIn: 'root',
})
export class EmployeesApiService {
  private readonly http = inject(HttpClient);
  private readonly defaultBaseUrl = 'http://localhost:3000';

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
   * Fetch Table Config from /identity/management/users/config/table
   */
  fetchTableConfig(baseUrl = this.defaultBaseUrl): Observable<TableConfigPayload> {
    const url = this.resolveUrl('/identity/management/users/config/table', baseUrl);
    return this.http.get<TableConfigPayload>(url);
  }

  /**
   * Fetch Columns Config from /identity/management/users/config/columns
   */
  fetchColumnsConfig(baseUrl = this.defaultBaseUrl): Observable<ColumnConfigMap> {
    const url = this.resolveUrl('/identity/management/users/config/columns', baseUrl);
    return this.http.get<ColumnConfigMap>(url);
  }

  /**
   * Fetch Actions Config from /identity/management/users/config/actions
   */
  fetchActionsConfig(baseUrl = this.defaultBaseUrl): Observable<ActionPanelConfigPayload> {
    const url = this.resolveUrl('/identity/management/users/config/actions', baseUrl);
    return this.http.get<ActionPanelConfigPayload>(url);
  }

  /**
   * Loads all 3 table configurations in parallel
   */
  bootstrap(baseUrl = this.defaultBaseUrl): Observable<{
    tableConfig: TableConfigPayload;
    columnsConfig: ColumnConfigMap;
    actionsConfig: ActionPanelConfigPayload;
    isLive: boolean;
  }> {
    return forkJoin({
      tableConfig: this.fetchTableConfig(baseUrl),
      columnsConfig: this.fetchColumnsConfig(baseUrl),
      actionsConfig: this.fetchActionsConfig(baseUrl),
    }).pipe(
      map(res => ({ ...res, isLive: true })),
      catchError(err => {
        console.warn('[EmployeesApiService] Backend API unreachable on :3000, using local configuration fallback.', err);
        return of({
          tableConfig: null as any,
          columnsConfig: null as any,
          actionsConfig: null as any,
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
      params = params.set('sort', sortKey).set('order', sortOrder);
    }

    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });

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
   * Create User via create_api
   */
  createUser(apiUrl: string, body: any, baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.post<any>(fullUrl, body);
  }

  /**
   * Update User via update_api (replaces :id)
   */
  updateUser(
    apiTemplate: string,
    id: string | number,
    body: any,
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const resolvedPath = apiTemplate.replace(':id', String(id));
    const fullUrl = this.resolveUrl(resolvedPath, baseUrl);
    return this.http.put<any>(fullUrl, body);
  }

  /**
   * Delete User via delete_api (replaces :id)
   */
  deleteUser(
    apiTemplate: string,
    id: string | number,
    baseUrl = this.defaultBaseUrl
  ): Observable<any> {
    const resolvedPath = apiTemplate.replace(':id', String(id));
    const fullUrl = this.resolveUrl(resolvedPath, baseUrl);
    return this.http.delete<any>(fullUrl);
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
    return this.http.post<any>(fullUrl, payload);
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
    return this.http.delete<any>(fullUrl);
  }
}
