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
    return this.http.post<any>(fullUrl, payload);
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
    return this.http.post<any>(fullUrl, payload);
  }
}
