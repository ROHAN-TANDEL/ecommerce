import { Component, OnInit, ChangeDetectorRef, inject, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeesApiService } from './employees-api.service';
import {
  TableConfigPayload,
  ColumnConfigMap,
  ColumnConfigItem,
  ActionPanelConfigPayload,
  ActionItemConfig,
  EnrichedColumn,
  PinnedToolbarAction,
  SectionActionGroup,
  ToastMessage,
  FilterDataItem,
  ActionDropdownOption,
  PaginationState,
} from './employees.types';
import {
  ButtonComponent,
  HeaderSectionComponent,
  ActionPanelComponent,
  RefreshComponent,
  SaveComponent,
  EditComponent,
  LockComponent,
  DensityComponent,
  type TableDensity,
  TableComponent,
  TableHeaderComponent,
  MasterComponent,
  HeaderComponent,
  FilterRowComponent,
  TableBodyComponent,
  CellComponent,
  TableFooterComponent,
  PaginationComponent,
  SectionRowComponent,
} from './components';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    HeaderSectionComponent,
    ActionPanelComponent,
    RefreshComponent,
    SaveComponent,
    EditComponent,
    LockComponent,
    DensityComponent,
    TableComponent,
    TableHeaderComponent,
    MasterComponent,
    HeaderComponent,
    FilterRowComponent,
    SectionRowComponent,
    TableBodyComponent,
    CellComponent,
    TableFooterComponent,
    PaginationComponent,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly apiService = inject(EmployeesApiService);

  // ══════════════════════════════════════════════════════════════════════
  // API CONNECTION & CONFIGURATION STATE
  // ══════════════════════════════════════════════════════════════════════
  apiBaseUrl = 'http://localhost:3000';
  apiStatus: 'connected' | 'offline-mock' | 'connecting' = 'connecting';
  isLoading = true;
  isDataLoading = false;

  // Fallback / Initial Table Config
  tableConfig: TableConfigPayload = {
    table_key: 'users_table_1234',
    display_name: 'User Management',
    add_data_button_name: '+ Add User',
    table_api: {
      paginated_data_api: '/identity/management/users',
      data_api: '/identity/management/users/:id',
      create_api: '/identity/management/users/create',
      create_bulk_api: '/identity/management/users/create/bulk',
      create_all_api: '/identity/management/users/create/all',
      create_import_api: '/identity/management/users/create/import',
      update_api: '/identity/management/users/update/:id',
      update_bulk_api: '/identity/management/users/update/bulk',
      update_all_api: '/identity/management/users/update/all',
      update_import_api: '/identity/management/users/update/import',
      delete_api: '/identity/management/users/delete/:id',
      delete_bulk_api: '/identity/management/users/delete/bulk',
      delete_all_api: '/identity/management/users/delete/all',
      column_config_api: '/identity/management/users/config/columns',
      table_config_api: '/identity/management/users/config/table',
      action_panel_config_api: '/identity/management/users/config/actions',
      table_lock_api: '/identity/management/lock/users/table',
      row_lock_api: '/identity/management/lock/users/rows',
      lock_status_api: '/identity/management/lock/users',
      export_data_api: '/identity/management/export/users',
      download_data_api: '/identity/management/download/users',
      get_view_api: '/identity/management/view/users',
      save_view_api: '/identity/management/view/users/save',
      live_talk_api: '/identity/management/talk/users',
      live_listen_api: '/identity/management/listen/users',
    },
    show_title_header_section: true,
    enable_add_data_button: true,
    show_table_headers: true,
    enable_table_search_filters: true,
    enable_row_level_checkboxes: true,
    enable_master_level_checkbox: true,
    min_height: '380px',
    max_height: 'calc(100vh - 240px)',
    editable_single_multiple_selected_rows: true,
    editable_all_rows: true,
    action_panel: true,
    action_column: {
      active: true,
      options: ['refresh', 'disable', 'revert', 'view', 'pin / unpin', 'lock', 'edit', 'delete'],
    },
    rows: {
      row_expansion: false,
      freez: true,
    },
    pagination: {
      active: true,
      default_page_size: 10,
      page_size_options: [10, 25, 50, 100],
    },
  };

  // Fallback / Initial Column Config Map
  rawColumnConfig: ColumnConfigMap = {
    first_name: {
      header_name: 'First Name',
      filter_key: 'first_name',
      columns: { users: 'first_name' },
      order: 1,
      filter_type: 'multi_search',
      editable: true,
      sorting: true,
      column_resize: true,
      info_note: 'User first name',
      elipsis: 'text_elipsis',
      active: true,
      freez: { freez_side: 'left', order: 1 },
      cell_mode: 'text_code_1000',
      filter_data: [],
      width: '180px',
    },
    last_name: {
      header_name: 'Last Name',
      filter_key: 'last_name',
      columns: { users: 'last_name' },
      filter_type: 'search',
      editable: false,
      order: 2,
      sorting: true,
      info_note: 'User last name',
      elipsis: 'text_elipsis',
      active: true,
      column_resize: true,
      cell_mode: 'text_code_1000',
      freez: { freez_side: 'left', order: 2 },
      filter_data: [],
      width: '180px',
    },
    email: {
      header_name: 'Email',
      filter_key: 'user_email',
      columns: { users: 'email' },
      filter_type: 'search',
      editable: true,
      sorting: true,
      info_note: 'User email address',
      elipsis: 'text_elipsis',
      active: true,
      order: 3,
      cell_mode: 'text_code_2000',
      column_resize: true,
      filter_data: [],
      width: '260px',
    },
    status: {
      header_name: 'Status',
      filter_key: 'user_name',
      columns: { users: 'status' },
      filter_type: 'list',
      editable: true,
      sorting: true,
      info_note: 'Current user status',
      elipsis: 'text_elipsis',
      cell_mode: 'text_code_3100',
      active: true,
      order: 4,
      column_resize: true,
      filter_data: [
        { key: 'active', name: 'Active', type: 'check_box', default: false },
        { key: 'inactive', name: 'Inactive', type: 'check_box', default: false },
        { key: 'pending', name: 'Pending', type: 'check_box', default: false },
      ],
      width: '150px',
    },
    created_at: {
      filter_key: 'user_created_at',
      header_name: 'Registration Date',
      columns: { users: 'created_at' },
      filter_type: 'date_range',
      editable: false,
      column_resize: true,
      cell_mode: 'text_code_4000',
      sorting: true,
      order: 5,
      info_note: 'Date user registered',
      elipsis: 'text_elipsis',
      active: true,
      filter_data: [],
      width: '190px',
    },
  };

  // Fallback / Initial Action Panel Config
  rawActionPanelConfig: ActionPanelConfigPayload = {
    sections: {
      section_1: { name: 'Actions', component: 'dropdown_sections_component', order: 1 },
      section_2: { name: 'Views', component: 'dropdown_sections_component', order: 2 },
      section_3: { name: 'More', component: 'dropdown_sections_component', order: 3 },
    },
    actions: {
      refresh: {
        name: 'Refresh',
        component: 'refresh_component',
        active: true,
        info_note: 'Refresh rows',
        pinned: true,
        section: 'section_2',
        order: 1,
      },
      lock: {
        name: 'Lock',
        active: true,
        component: 'lock_component',
        pinned: true,
        info_note: 'Lock table',
        section: 'section_2',
        order: 2,
      },
      edit: {
        name: 'Edit',
        active: true,
        component: 'edit_component',
        pinned: true,
        info_note: 'Edit selected rows',
        section: 'section_1',
        order: 1,
      },
      save: {
        name: 'Save',
        active: true,
        component: 'save_component',
        pinned: true,
        info_note: 'Save rows',
        section: 'section_1',
        order: 2,
      },
      delete: {
        name: 'Delete',
        active: true,
        component: 'delete_component',
        info_note: 'Delete selected rows',
        section: 'section_1',
        order: 3,
      },
      enable: {
        name: 'Enable',
        active: true,
        component: 'enable_component',
        info_note: 'Enable selected rows',
        section: 'section_1',
        order: 4,
      },
      disable: {
        name: 'Disable',
        active: true,
        component: 'disable_component',
        info_note: 'Disable selected rows',
        section: 'section_1',
        order: 5,
      },
      revert: {
        name: 'Revert',
        active: true,
        component: 'revert_component',
        info_note: 'Revert selected rows',
        section: 'section_2',
        order: 3,
      },
      expand: {
        name: 'Expand',
        active: true,
        component: 'expand_component',
        info_note: '',
        section: 'section_1',
        order: 6,
      },
      copy: {
        name: 'Copy',
        active: true,
        component: 'copy_component',
        info_note: '',
        section: 'section_1',
        order: 7,
      },
      reset: {
        name: 'Reset',
        active: true,
        component: 'reset_component',
        info_note: '',
        section: 'section_3',
        order: 1,
      },
      export: {
        name: 'Export',
        active: true,
        component: 'export_component',
        info_note: '',
        dropdown_options: {
          excel: { display_name: 'Excel (.xlsx)', info_note: 'Download max 10k rows' },
          csv: { display_name: 'CSV (.csv)', info_note: 'Standard CSV file' },
        },
        section: 'section_1',
        order: 8,
      },
      download: {
        name: 'Download',
        active: true,
        component: 'download_component',
        info_note: '',
        dropdown_options: {
          excel: { display_name: 'Excel (.xlsx)', info_note: 'Download max 10k rows' },
          csv: { display_name: 'CSV (.csv)', info_note: 'Standard CSV file' },
        },
        section: 'section_1',
        order: 9,
      },
      fullscreen: {
        name: 'Full Screen',
        active: true,
        component: 'fullscreen_component',
        info_note: '',
        section: 'section_2',
        order: 10,
      },
      collapse: {
        name: 'Collapse',
        active: true,
        component: 'collapse_component',
        info_note: '',
        section: 'section_2',
        order: 11,
      },
      view: {
        name: 'View',
        active: true,
        component: 'view_component',
        info_note: '',
        dropdown_default_value: 'default_view',
        dropdown_options: {
          default_view: { display_name: 'Default View' },
          current_view: { display_name: 'Save Current View' },
          reset_view: { display_name: 'Reset View' },
        },
        section: 'section_2',
        order: 12,
      },
      density: {
        name: 'Density',
        component: 'density_component',
        active: true,
        info_note: '',
        dropdown_default_value: 'comfortable',
        dropdown_options: {
          comfortable: { display_name: 'Comfortable' },
          spacious: { display_name: 'Spacious' },
          compact: { display_name: 'Compact' },
        },
        section: 'section_2',
        order: 14,
      },
      columns: {
        name: 'Columns',
        component: 'column_component',
        active: true,
        info_note: '',
        dynamic_dropdown: true,
        section: 'section_3',
        order: 1,
      },
      scroller: {
        name: 'Column Navigator',
        active: true,
        component: 'scroller_component',
        info_note: '',
        section: 'section_3',
        order: 2,
      },
      live: {
        name: 'Live Collaboration',
        component: 'live_component_option',
        active: true,
        info_note: '',
        section: 'section_3',
        order: 3,
      },
    },
  };

  // ══════════════════════════════════════════════════════════════════════
  // ADAPTER ENGINE STATE (Derived dynamically from configs)
  // ══════════════════════════════════════════════════════════════════════
  columnsList: EnrichedColumn[] = [];
  pinnedActions: PinnedToolbarAction[] = [];
  sectionGroups: SectionActionGroup[] = [];

  // Table Data & Pagination
  rows: Record<string, any>[] = [];
  pagination: PaginationState = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  // Filter & Sort state
  activeFilters: Record<string, any> = {};
  sectionRowValues: Record<string, any> = {};
  sortState: Record<string, 'asc' | 'desc' | null> = { first_name: 'asc' };

  // Component Inputs & Outputs (Event boundaries)
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Input() minHeight = '380px';
  @Input() maxHeight = 'calc(100vh - 240px)';
  @Output() densityChange = new EventEmitter<'compact' | 'comfortable' | 'spacious'>();
  @Output() actionClicked = new EventEmitter<{ actionKey: string; optionKey?: string; value?: any }>();
  @Output() selectionChange = new EventEmitter<string[]>();

  // Checkbox & Height Getters (driven by tableConfig with input fallbacks)
  get enableRowLevelCheckboxes(): boolean {
    return this.tableConfig.enable_row_level_checkboxes !== false;
  }

  get enableMasterLevelCheckbox(): boolean {
    return this.tableConfig.enable_master_level_checkbox !== false;
  }

  get hasCheckboxColumn(): boolean {
    return this.enableRowLevelCheckboxes || this.enableMasterLevelCheckbox;
  }

  get tableMinHeight(): string {
    return this.tableConfig.min_height || this.minHeight;
  }

  get tableMaxHeight(): string {
    return this.tableConfig.max_height || this.maxHeight;
  }

  get cleanAddButtonName(): string {
    const raw = this.tableConfig.add_data_button_name || 'Add User';
    return raw.replace(/^\+\s*/, '');
  }

  // UI Interactive States
  actionsMenuOpen = false;
  activeSubmenuKey: string | null = null;
  activeFilterDropdownKey: string | null = null;
  activeRowActionId: string | null = null;
  selectedRowIds = new Set<string>();
  isEditModeActive = false;
  isLocked = false;

  // Getter/setter for backward compatibility with template checkmark
  get selectedDensity(): 'compact' | 'comfortable' | 'spacious' {
    return this.density;
  }
  set selectedDensity(val: 'compact' | 'comfortable' | 'spacious') {
    this.density = val;
  }

  // Modals for End-to-End CRUD
  showCreateModal = false;
  showEditModal = false;
  createForm = { first_name: '', last_name: '', email: '', password_hash: 'Password123!', status: 'active' };
  editForm = { id: '', first_name: '', last_name: '', email: '', status: 'active' };

  // Floating Toast Stack
  toasts: ToastMessage[] = [];
  private toastCounter = 0;

  // Local Mock Dataset (Used when backend is offline or on initial fallback)
  readonly defaultMockRows: Record<string, any>[] = [
    { id: '1', first_name: 'Liam', last_name: 'Walker', email: 'liam.walker@enterprise.io', status: 'active', created_at: '2026-09-12 10:45 AM' },
    { id: '2', first_name: 'Olivia', last_name: 'Brooks', email: 'olivia.brooks@enterprise.io', status: 'pending', created_at: '2026-09-14 02:18 PM' },
    { id: '3', first_name: 'Ethan', last_name: 'Hayes', email: 'ethan.hayes@enterprise.io', status: 'active', created_at: '2026-09-16 11:30 AM' },
    { id: '4', first_name: 'Sophia', last_name: 'Bennett', email: 'sophia.bennett@enterprise.io', status: 'inactive', created_at: '2026-09-18 09:12 AM' },
    { id: '5', first_name: 'Noah', last_name: 'Carter', email: 'noah.carter@enterprise.io', status: 'active', created_at: '2026-09-20 04:55 PM' },
    { id: '6', first_name: 'Ava', last_name: 'Mitchell', email: 'ava.mitchell@enterprise.io', status: 'pending', created_at: '2026-09-22 01:20 PM' },
    { id: '7', first_name: 'Lucas', last_name: 'Sullivan', email: 'lucas.sullivan@enterprise.io', status: 'active', created_at: '2026-09-24 08:40 AM' },
    { id: '8', first_name: 'Mia', last_name: 'Reynolds', email: 'mia.reynolds@enterprise.io', status: 'inactive', created_at: '2026-09-26 03:15 PM' },
  ];

  ngOnInit(): void {
    this.bootstrapTable();
  }

  // ══════════════════════════════════════════════════════════════════════
  // END-TO-END BOOTSTRAP & DATA FETCHING
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Loads the 3 configuration APIs in parallel and then fetches initial paginated data
   */
  bootstrapTable(): void {
    this.isLoading = true;
    this.apiStatus = 'connecting';
    this.cdr.markForCheck();

    this.apiService.bootstrap(this.apiBaseUrl).subscribe({
      next: res => {
        if (res.isLive && res.tableConfig && res.columnsConfig && res.actionsConfig) {
          this.tableConfig = res.tableConfig;
          this.rawColumnConfig = res.columnsConfig;
          this.rawActionPanelConfig = res.actionsConfig;
          this.apiStatus = 'connected';
          this.showToast(
            'API Connected (Live)',
            `Bootstrap successful from ${this.apiBaseUrl}`,
            'header'
          );
        } else {
          this.apiStatus = 'offline-mock';
          this.showToast(
            'Offline Mock Mode',
            `Backend offline on ${this.apiBaseUrl} — using schema fallback`,
            'header'
          );
        }

        this.processColumns();
        this.processActions();
        this.fetchTableData(1, this.tableConfig.pagination.default_page_size || 10);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.apiStatus = 'offline-mock';
        this.processColumns();
        this.processActions();
        this.fetchTableData(1, 10);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Fetches paginated rows from tableConfig.table_api.paginated_data_api
   */
  fetchTableData(page = this.pagination.page, limit = this.pagination.limit): void {
    this.isDataLoading = true;
    this.cdr.markForCheck();

    const dataApiUrl = this.tableConfig.table_api.paginated_data_api || '/identity/management/users';
    const activeSortCol = Object.keys(this.sortState).find(k => this.sortState[k] !== null);
    const sortOrder = activeSortCol ? this.sortState[activeSortCol] : undefined;

    this.apiService
      .fetchPaginatedData(
        dataApiUrl,
        page,
        limit,
        this.activeFilters,
        activeSortCol,
        sortOrder,
        this.apiBaseUrl
      )
      .subscribe({
        next: result => {
          if (result.isLive && result.rows.length > 0) {
            this.rows = result.rows;
            this.pagination = result.pagination;
          } else {
            // Apply client-side fallback slicing & filtering
            this.applyLocalDataFilter(page, limit);
          }
          this.isDataLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.applyLocalDataFilter(page, limit);
          this.isDataLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private applyLocalDataFilter(page: number, limit: number): void {
    let dataset = [...this.defaultMockRows];

    // Filter
    Object.keys(this.activeFilters).forEach(key => {
      const val = this.activeFilters[key];
      if (val !== undefined && val !== null && val !== '') {
        const colDef = this.columnsList.find(c => c.filter_key === key || c.key === key);
        const rowProp = colDef ? colDef.key : key;

        if (Array.isArray(val)) {
          if (val.length > 0) {
            dataset = dataset.filter(r => {
              const cellStr = String(r[rowProp] ?? r[key] ?? '').toLowerCase();
              return val.some(entry => cellStr.includes(String(entry).trim().toLowerCase()));
            });
          }
        } else {
          const query = String(val).toLowerCase();
          dataset = dataset.filter(r => {
            const cellStr = String(r[rowProp] ?? r[key] ?? '').toLowerCase();
            return cellStr.includes(query);
          });
        }
      }
    });

    // Sort
    const activeSortCol = Object.keys(this.sortState).find(k => this.sortState[k] !== null);
    if (activeSortCol && this.sortState[activeSortCol]) {
      const dir = this.sortState[activeSortCol];
      dataset.sort((a, b) => {
        const vA = String(a[activeSortCol] ?? '');
        const vB = String(b[activeSortCol] ?? '');
        return dir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      });
    }

    const total = dataset.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;

    this.rows = dataset.slice(start, start + limit);
    this.pagination = { page: safePage, limit, total, totalPages };
  }

  // ── Column Adapter: Computes orders, freeze left offsets & widths ────
  private processColumns(): void {
    const list: EnrichedColumn[] = Object.keys(this.rawColumnConfig)
      .map(key => {
        const item = this.rawColumnConfig[key];
        return {
          ...item,
          key,
          computedWidth: item.width || '180px',
          isFrozen: !!(item.freez && item.freez.freez_side === 'left'),
        };
      })
      .sort((a, b) => a.order - b.order);

    let currentLeftOffset = this.hasCheckboxColumn ? 50 : 0; // Checkbox column is 50px if active
    list.forEach(col => {
      if (col.isFrozen) {
        col.stickyLeft = `${currentLeftOffset}px`;
        const widthPx = parseInt(col.computedWidth.replace('px', ''), 10) || 180;
        currentLeftOffset += widthPx;
      }
    });

    this.columnsList = list;
  }

  // ── Action Panel Adapter: Splits pinned vs. section groups ───────────
  private processActions(): void {
    const actionsMap = this.rawActionPanelConfig.actions;
    const sectionsMap = this.rawActionPanelConfig.sections;

    this.pinnedActions = Object.keys(actionsMap)
      .filter(key => actionsMap[key].pinned === true && actionsMap[key].active === true)
      .map(key => ({ ...actionsMap[key], key }))
      .sort((a, b) => a.order - b.order);

    const sectionKeys = Object.keys(sectionsMap).sort(
      (a, b) => sectionsMap[a].order - sectionsMap[b].order
    );

    this.sectionGroups = sectionKeys.map(sKey => {
      const section = sectionsMap[sKey];
      const items = Object.keys(actionsMap)
        .filter(
          aKey =>
            actionsMap[aKey].section === sKey &&
            actionsMap[aKey].pinned !== true &&
            actionsMap[aKey].active === true
        )
        .map(aKey => ({ ...actionsMap[aKey], key: aKey }))
        .sort((a, b) => a.order - b.order);

      return {
        sectionKey: sKey,
        name: section.name,
        order: section.order,
        actions: items,
      };
    });
  }

  // ── Global Document Click Listener ──────────────────────────────────
  @HostListener('document:click')
  onDocumentClick(): void {
    this.actionsMenuOpen = false;
    this.activeSubmenuKey = null;
    this.activeFilterDropdownKey = null;
    this.activeRowActionId = null;
    this.cdr.markForCheck();
  }

  // ── Floating Toast System ───────────────────────────────────────────
  showToast(title: string, detail?: string, source: ToastMessage['source'] = 'toolbar'): void {
    const id = ++this.toastCounter;
    const toast: ToastMessage = { id, title, detail, source };
    this.toasts.unshift(toast);

    if (this.toasts.length > 4) {
      this.toasts.pop();
    }
    this.cdr.markForCheck();

    setTimeout(() => {
      this.dismissToast(id);
    }, 3500);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }

  // ── Interactive Actions & CRUD Handlers ─────────────────────────────

  isBottomRow(index: number): boolean {
    return index >= Math.floor(this.rows.length / 2);
  }

  onHeaderAddDataClick(): void {
    this.showCreateModal = true;
    this.createForm = { first_name: '', last_name: '', email: '', password_hash: 'Password123!', status: 'active' };
  }

  submitCreateUser(): void {
    if (!this.createForm.first_name || !this.createForm.email) {
      this.showToast('Validation Error', 'First name and email are required.', 'header');
      return;
    }

    const createUrl = this.tableConfig.table_api.create_api || '/identity/management/users/create';
    this.apiService.createUser(createUrl, this.createForm, this.apiBaseUrl).subscribe({
      next: res => {
        this.showToast('User Created', res?.message || 'New user record created successfully via API', 'header');
        this.showCreateModal = false;
        this.fetchTableData();
      },
      error: () => {
        // Fallback local append
        this.defaultMockRows.unshift({
          id: String(Date.now()),
          ...this.createForm,
          created_at: new Date().toLocaleDateString(),
        });
        this.showToast('User Created (Local)', `${this.createForm.first_name} added to table`, 'header');
        this.showCreateModal = false;
        this.fetchTableData();
      },
    });
  }

  submitEditUser(): void {
    const updateUrl = this.tableConfig.table_api.update_api || '/identity/management/users/update/:id';
    this.apiService.updateUser(updateUrl, this.editForm.id, this.editForm, this.apiBaseUrl).subscribe({
      next: res => {
        this.showToast('User Updated', res?.message || `User ID ${this.editForm.id} updated via API`, 'row');
        this.showEditModal = false;
        this.fetchTableData();
      },
      error: () => {
        const local = this.defaultMockRows.find(r => r['id'] === this.editForm.id);
        if (local) {
          local['first_name'] = this.editForm.first_name;
          local['last_name'] = this.editForm.last_name;
          local['email'] = this.editForm.email;
          local['status'] = this.editForm.status;
        }
        this.showToast('User Updated (Local)', `Changes saved for ID: ${this.editForm.id}`, 'row');
        this.showEditModal = false;
        this.fetchTableData();
      },
    });
  }

  onPinnedActionClick(action: PinnedToolbarAction): void {
    this.actionClicked.emit({ actionKey: action.key });

    if (action.key === 'refresh') {
      this.bootstrapTable();
      this.showToast('[Refresh Triggered]', 'Re-syncing table configurations and rows from API', 'toolbar');
      return;
    }
    this.showToast(`[Toolbar] ${action.name}`, `Component: ${action.component} (Section: ${action.section})`, 'toolbar');
  }

  toggleActionsMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.actionsMenuOpen = !this.actionsMenuOpen;
    this.activeSubmenuKey = null;
    this.cdr.markForCheck();
  }

  onActionItemClick(e: MouseEvent, action: ActionItemConfig & { key: string }): void {
    e.stopPropagation();
    if (action.dropdown_options || action.dynamic_dropdown) {
      this.activeSubmenuKey = this.activeSubmenuKey === action.key ? null : action.key;
      this.cdr.markForCheck();
      return;
    }
    this.actionsMenuOpen = false;
    this.activeSubmenuKey = null;

    this.actionClicked.emit({ actionKey: action.key });

    if (action.key === 'reset') {
      this.activeFilters = {};
      this.sortState = { first_name: 'asc' };
      this.fetchTableData(1, this.pagination.limit);
      this.showToast('Table Reset', 'Cleared all filters and sorting', 'dropdown');
      return;
    }

    this.showToast(`[Actions Menu] ${action.name}`, `Action: ${action.key}`, 'dropdown');
  }

  onDensityChange(d: TableDensity): void {
    this.density = d;
    this.densityChange.emit(d);
    this.actionClicked.emit({ actionKey: 'density', value: d });
    this.showToast('[Density Event Emitted]', `Density changed to "${d}"`, 'dropdown');
    this.cdr.markForCheck();
  }

  onLockToggle(locked: boolean): void {
    this.isLocked = locked;
    this.actionClicked.emit({ actionKey: 'lock', value: locked });
    this.showToast(locked ? 'Table Locked' : 'Table Unlocked', locked ? 'Table is now in read-only lock state' : 'Lock released', 'toolbar');
    this.cdr.markForCheck();
  }

  onEditClick(): void {
    this.actionClicked.emit({ actionKey: 'edit' });
    this.showToast('[Edit Event Emitted]', 'Edit event emitted for external consumer', 'toolbar');
  }

  onEditToggle(editing?: boolean): void {
    // Actions are deferred to another phase; do not alter table inline edit mode
    this.isEditModeActive = false;
    this.actionClicked.emit({ actionKey: 'edit', value: editing });
    this.showToast('[Edit Event Emitted]', 'Edit event emitted for external consumer', 'toolbar');
    this.cdr.markForCheck();
  }

  onSaveClick(): void {
    this.actionClicked.emit({ actionKey: 'save' });
    this.showToast('Save Triggered', 'Saving in-place table modifications via API', 'toolbar');
  }

  onActionPanelSelect(event: { actionKey: string; optionKey?: string }): void {
    if (event.actionKey === 'reset') {
      this.activeFilters = {};
      this.sortState = { first_name: 'asc' };
      this.fetchTableData(1, this.pagination.limit);
      this.showToast('Table Reset', 'Cleared all filters and sorting', 'dropdown');
      return;
    }
    this.showToast(`[Action] ${event.actionKey}`, event.optionKey ? `Option: ${event.optionKey}` : undefined, 'dropdown');
  }

  onFilterChange(event: { col: EnrichedColumn; value: string | string[] }): void {
    if (event.value && (typeof event.value === 'string' ? event.value.length > 0 : event.value.length > 0)) {
      this.activeFilters[event.col.filter_key] = event.value;
    } else {
      delete this.activeFilters[event.col.filter_key];
    }
    this.fetchTableData(1, this.pagination.limit);
    const displayVal = Array.isArray(event.value) ? event.value.join(', ') : event.value;
    this.showToast(`Filter Applied: ${event.col.header_name}`, displayVal ? `Value: "${displayVal}"` : 'Filter Cleared', 'filter');
  }

  onFilterTrigger(event: { col: EnrichedColumn; action: string }): void {
    this.showToast(`[Filter: ${event.action}]`, `Opened filter selector for ${event.col.header_name}`, 'filter');
  }

  onSectionRowChange(event: { col: EnrichedColumn; value: string | string[] }): void {
    if (event.value && (typeof event.value === 'string' ? event.value.length > 0 : event.value.length > 0)) {
      this.sectionRowValues[event.col.filter_key] = event.value;
    } else {
      delete this.sectionRowValues[event.col.filter_key];
    }
    const displayVal = Array.isArray(event.value) ? event.value.join(', ') : event.value;
    this.actionClicked.emit({ actionKey: 'section_row_change', optionKey: event.col.key, value: event.value });
    this.showToast(`[Section Row] ${event.col.header_name}`, displayVal ? `Value: "${displayVal}"` : 'Cleared', 'row');
    this.cdr.markForCheck();
  }

  onSectionRowAction(event: { col: EnrichedColumn; action: string }): void {
    this.actionClicked.emit({ actionKey: 'section_row_action', optionKey: event.col.key, value: event.action });
    this.showToast(`[Section Row Action] ${event.col.header_name}`, `Action: ${event.action}`, 'row');
    this.cdr.markForCheck();
  }

  toggleFilterDropdown(e: MouseEvent, colKey: string): void {
    e.stopPropagation();
    this.activeFilterDropdownKey = this.activeFilterDropdownKey === colKey ? null : colKey;
    this.cdr.markForCheck();
  }

  onFilterItemClick(e: MouseEvent, col: EnrichedColumn, item: FilterDataItem): void {
    e.stopPropagation();
    this.activeFilterDropdownKey = null;
    this.activeFilters[col.filter_key] = item.key;
    this.fetchTableData(1, this.pagination.limit);
    this.showToast(`Filter Applied: ${col.header_name}`, `Value: ${item.name}`, 'filter');
  }

  onSearchInput(col: EnrichedColumn, value: string): void {
    this.activeFilters[col.filter_key] = value.trim();
    this.fetchTableData(1, this.pagination.limit);
    this.showToast(`Search Applied: ${col.header_name}`, `Query: "${value}"`, 'filter');
  }

  onHeaderSortClick(event: EnrichedColumn | { columnKey: string; direction?: 'asc' | 'desc' | null }): void {
    const colKey = 'columnKey' in event ? event.columnKey : event.key;
    const col = this.columnsList.find(c => c.key === colKey) || (event as EnrichedColumn);
    if (!col || !col.sorting) return;

    let next: 'asc' | 'desc' | null;
    if ('direction' in event && event.direction !== undefined) {
      next = event.direction;
    } else {
      const current = this.sortState[col.key];
      next = current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc';
    }

    this.sortState = { [col.key]: next };
    this.fetchTableData(1, this.pagination.limit);
    this.showToast(`Sort: ${col.header_name}`, next ? `Direction: ${next.toUpperCase()}` : 'Cleared', 'header');
  }

  toggleRowActionMenu(e: MouseEvent, rowId: string): void {
    e.stopPropagation();
    this.activeRowActionId = this.activeRowActionId === rowId ? null : rowId;
    this.cdr.markForCheck();
  }

  onRowActionClick(e: MouseEvent, optionKey: string, row: Record<string, any>): void {
    e.stopPropagation();
    this.activeRowActionId = null;

    if (optionKey === 'delete') {
      const deleteUrl = this.tableConfig.table_api.delete_api || '/identity/management/users/delete/:id';
      this.apiService.deleteUser(deleteUrl, row['id'], this.apiBaseUrl).subscribe({
        next: res => {
          this.showToast('User Deleted', res?.message || `User ID ${row['id']} deleted via API`, 'row');
          this.fetchTableData();
        },
        error: () => {
          const idx = this.defaultMockRows.findIndex(r => r['id'] === row['id']);
          if (idx !== -1) this.defaultMockRows.splice(idx, 1);
          this.showToast('User Deleted (Local)', `Deleted row: ${row['first_name']}`, 'row');
          this.fetchTableData();
        },
      });
      return;
    }

    if (optionKey === 'edit') {
      this.actionClicked.emit({ actionKey: 'edit', value: row });
      this.showToast(`[Row Action] edit`, `Row: ${row['first_name']} ${row['last_name']}`, 'row');
      return;
    }

    if (optionKey === 'refresh') {
      this.fetchTableData();
      this.showToast('Refreshed', `Reloaded row data from API`, 'row');
      return;
    }

    this.showToast(`[Row Action] ${optionKey}`, `Row: ${row['first_name']} ${row['last_name']}`, 'row');
  }

  toggleSelectAll(): void {
    if (this.selectedRowIds.size === this.rows.length) {
      this.selectedRowIds.clear();
      this.showToast('Selection Cleared', 'All rows deselected', 'header');
    } else {
      this.rows.forEach(r => this.selectedRowIds.add(String(r['id'])));
      this.showToast('Selected All Rows', `${this.rows.length} rows selected`, 'header');
    }
    this.selectionChange.emit(Array.from(this.selectedRowIds));
    this.cdr.markForCheck();
  }

  toggleRowSelect(e: MouseEvent, rowId: string): void {
    e.stopPropagation();
    const strId = String(rowId);
    if (this.selectedRowIds.has(strId)) {
      this.selectedRowIds.delete(strId);
    } else {
      this.selectedRowIds.add(strId);
    }
    this.selectionChange.emit(Array.from(this.selectedRowIds));
    this.showToast('Row Selection Changed', `${this.selectedRowIds.size} row(s) selected`, 'row');
    this.cdr.markForCheck();
  }

  onPaginationPageChange(page: number): void {
    this.pagination.page = page;
    this.fetchTableData(page, this.pagination.limit);
  }

  onPaginationLimitChange(limit: number): void {
    this.pagination.limit = limit;
    this.pagination.page = 1;
    this.fetchTableData(1, limit);
  }
}
