import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, Subject, tap } from 'rxjs';
import {
  TableConfigPayload,
  ColumnConfigMap,
  ActionPanelConfigPayload,
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
  // LIVE BROADCAST BUS & MULTI-USER PRESENCE TRACKING
  // ══════════════════════════════════════════════════════════════════════
  readonly liveEvents$ = new Subject<LiveTableEvent>();
  readonly userPresence$ = new Subject<TableUserPresence>();

  private presences = new Map<string, TableUserPresence>();

  notifyDataChanged(): void {
    this.dataChanged$.next();
  }

  notifyViewsChanged(): void {
    this.viewsChanged$.next();
  }

  broadcastLiveEvent(event: Omit<LiveTableEvent, 'id' | 'timestamp'>): void {
    const fullEvent: LiveTableEvent = {
      ...event,
      id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
    };
    this.liveEvents$.next(fullEvent);
  }

  updatePresence(presence: TableUserPresence): void {
    this.presences.set(presence.instanceId, { ...presence });
    this.userPresence$.next({ ...presence });
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
    return this.http.post<any>(fullUrl, body).pipe(
      tap(() => this.notifyDataChanged())
    );
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
    return this.http.put<any>(fullUrl, body).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Bulk Update Users
   */
  updateBulkUsers(apiUrl: string, rows: any[], baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.put<any>(fullUrl, { rows }).pipe(
      tap(() => this.notifyDataChanged())
    );
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
    return this.http.delete<any>(fullUrl).pipe(
      tap(() => this.notifyDataChanged())
    );
  }

  /**
   * Delete Bulk Users
   */
  deleteBulkUsers(apiUrl: string, ids: (string | number)[], baseUrl = this.defaultBaseUrl): Observable<any> {
    const fullUrl = this.resolveUrl(apiUrl, baseUrl);
    return this.http.delete<any>(fullUrl, { body: { ids } }).pipe(
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
}
