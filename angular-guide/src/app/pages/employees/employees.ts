import { Component, OnInit, ChangeDetectorRef, inject, HostListener, Input, Output, EventEmitter, ViewChild } from '@angular/core';
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
  LiveComponent,
  DropdownSectionsComponent,
  ScrollerComponent,
  ColumnsComponent,
  ViewComponent,
  OptionsDropdownComponent,
  ActionBtnComponent,
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
    LiveComponent,
    DropdownSectionsComponent,
    ScrollerComponent,
    ColumnsComponent,
    ViewComponent,
    OptionsDropdownComponent,
    ActionBtnComponent,
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
  // Fallback / Initial Action Panel Config (http://localhost:3000/identity/management/users/config/actions)
  rawActionPanelConfig: ActionPanelConfigPayload = {
    sections: {
      section_1: {
        name: 'Actions',
        component: 'dropdown_sections_component',
        order: 1,
        pinned: true,
      },
      section_2: {
        name: 'Views',
        component: 'dropdown_sections_component',
        order: 2,
        pinned: true,
      },
      section_3: {
        name: 'More',
        component: 'dropdown_sections_component',
        order: 3,
        pinned: true,
      },
      section_4: {
        name: 'Exports',
        component: 'dropdown_sections_component',
        order: 4,
        pinned: true,
      },
    },
    actions: {
      refresh: {
        name: 'Refresh',
        component: 'refresh_component',
        active: true,
        info_note: 'Refresh rows',
        pinned: false,
        section: 'section_2',
        order: 1,
      },
      lock: {
        name: 'Lock',
        active: true,
        component: 'lock_component',
        pinned: true,
        info_note: 'Lock table for 60s',
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
        info_note: 'Expand selected rows',
        section: 'section_1',
        order: 6,
      },
      copy: {
        name: 'Copy',
        active: true,
        component: 'copy_component',
        info_note: 'Copy selected rows',
        section: 'section_1',
        order: 7,
      },
      reset: {
        name: 'Reset',
        active: true,
        component: 'reset_component',
        info_note: 'reset & clear all the filters',
        section: 'section_3',
        order: 1,
      },
      export: {
        name: 'Export',
        active: true,
        component: 'export_component',
        info_note: 'Export rows',
        dropdown_options: {
          excel: {
            display_name: 'excel .xlsx',
            info_note: 'download max 10k rows',
          },
          csv: {
            display_name: 'csv download',
            info_note: 'csv download',
          },
        },
        section: 'section_4',
        order: 8,
      },
      download: {
        name: 'Download',
        active: true,
        component: 'download_component',
        info_note: 'Download data',
        dropdown_options: {
          excel: {
            display_name: 'excel .xlsx',
            info_note: 'download max 10k rows',
          },
          csv: {
            display_name: 'csv download',
            info_note: 'csv download',
          },
        },
        section: 'section_4',
        order: 9,
      },
      fullscreen: {
        name: 'Full Screen',
        active: true,
        component: 'fullscreen_component',
        info_note: 'Maximize & Minimize table',
        section: 'section_2',
        order: 10,
      },
      collapse: {
        name: 'Collapse',
        active: true,
        component: 'collapse_component',
        info_note: 'Collapse rows',
        section: 'section_2',
        order: 11,
      },
      view: {
        name: 'View',
        active: true,
        component: 'view_component',
        info_note: 'load saved filters',
        dropdown_default_value: 'default_view',
        dropdown_options: {
          default_view: {
            display_name: 'Default',
          },
          current_view: {
            display_name: 'Save current view',
          },
          reset_view: {
            display_name: 'Reset view',
          },
        },
        section: 'section_2',
        order: 12,
      },
      density: {
        name: 'Density',
        component: 'density_component',
        active: true,
        info_note: 'Adjust spacing between rows',
        dropdown_default_value: 'comfortable',
        dropdown_options: {
          comfortable: {
            display_name: 'Comfortable',
          },
          spacious: {
            display_name: 'Spacious',
          },
          compact: {
            display_name: 'Compact',
          },
        },
        section: 'section_2',
        order: 14,
      },
      columns: {
        name: 'Columns',
        component: 'column_component',
        active: true,
        info_note: 'Columns view, reorder & configuration',
        dynamic_dropdown: true,
        section: 'section_3',
        order: 1,
      },
      scroller: {
        name: 'Scroller',
        active: true,
        component: 'scroller_component',
        info_note: 'Horizontal scroller',
        pinned: false,
        section: 'section_3',
        order: 2,
      },
      live: {
        name: 'Live',
        component: 'live_component_option',
        active: true,
        info_note: 'Show live panel feed',
        pinned: true,
        section: 'section_3',
        order: 3,
      },
    },
  };

  // ══════════════════════════════════════════════════════════════════════
  // ADAPTER ENGINE STATE (Derived dynamically from configs)
  // ══════════════════════════════════════════════════════════════════════
  columnsList: EnrichedColumn[] = [];
  allColumnsList: EnrichedColumn[] = [];
  pinnedActions: PinnedToolbarAction[] = [];
  sectionGroups: SectionActionGroup[] = [];

  @ViewChild(TableComponent) tableComponent?: TableComponent;

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
  isLiveFeedActive = false;
  isMasterSelected = false;
  isSaving = false;

  // 12 Actions Extended State
  isFullscreen = false;
  isTableCollapsed = false;
  showDeleteConfirmModal = false;
  deleteTargetRowIds: string[] = [];
  scrollPercentage = 0;
  isTableScrollable = false;

  private readonly originalRowData = new Map<string, Record<string, any>>();

  get isSecondSectionActive(): boolean {
    return this.isEditModeActive && this.selectedRowIds.size > 0;
  }

  get isIndividualRowSelectionActive(): boolean {
    return this.selectedRowIds.size > 0 && !this.isMasterCheckboxChecked && !this.isMasterSelected;
  }

  isActionDisabled(actionKey: string): boolean {
    if (actionKey === 'copy' || actionKey === 'enable' || actionKey === 'disable' || actionKey === 'delete') {
      return !this.isIndividualRowSelectionActive;
    }
    if (actionKey === 'revert') {
      return !this.hasDirtyRows;
    }
    return false;
  }

  getActionTooltip(action: any): string {
    if (!action) return '';
    const key = action.key || '';
    if (key === 'copy' || key === 'enable' || key === 'disable' || key === 'delete') {
      if (this.isMasterCheckboxChecked || this.isMasterSelected) {
        return `${action.name || key} is disabled when master checkbox is selected`;
      }
      if (!this.isIndividualRowSelectionActive) {
        return `Select 1 or more individual rows to ${(action.name || key).toLowerCase()}`;
      }
    }
    if (key === 'revert' && !this.hasDirtyRows) {
      return 'No unsaved changes to revert';
    }
    return action.info_note || action.name || key;
  }

  get modifiedRows(): { row: Record<string, any>; original: Record<string, any>; diff: Record<string, { from: any; to: any }> }[] {
    const list: { row: Record<string, any>; original: Record<string, any>; diff: Record<string, { from: any; to: any }> }[] = [];

    this.rows.forEach(row => {
      const rowId = String(row['id']);
      const orig = this.originalRowData.get(rowId);
      if (!orig) {
        // Newly copied / created row
        list.push({ row, original: {}, diff: { _new: { from: null, to: true } } });
        return;
      }

      const diff: Record<string, { from: any; to: any }> = {};
      let isDirty = false;

      this.allColumnsList.forEach(col => {
        if (col.editable || col.key === 'status') {
          const currentVal = row[col.key];
          const origVal = orig[col.key];
          const normCurrent = currentVal === undefined || currentVal === null ? '' : String(currentVal).trim();
          const normOrig = origVal === undefined || origVal === null ? '' : String(origVal).trim();

          if (normCurrent !== normOrig) {
            diff[col.key] = { from: origVal, to: currentVal };
            isDirty = true;
          }
        }
      });

      if (row['disabled'] !== orig['disabled']) {
        diff['disabled'] = { from: orig['disabled'], to: row['disabled'] };
        isDirty = true;
      }

      if (isDirty) {
        list.push({ row, original: orig, diff });
      }
    });

    return list;
  }

  get hasDirtyRows(): boolean {
    return this.modifiedRows.length > 0;
  }

  get dirtyRowCount(): number {
    return this.modifiedRows.length;
  }

  get editButtonTooltip(): string {
    if (this.selectedRowIds.size === 0) {
      return 'Select at least one row to edit';
    }
    return this.isEditModeActive ? 'Close master edit filter' : 'Edit selected rows';
  }

  get saveButtonTooltip(): string {
    if (!this.hasDirtyRows) {
      return 'No pending changes to save';
    }
    return `Save ${this.dirtyRowCount} modified row(s)`;
  }

  get selectableRows(): Record<string, any>[] {
    return this.rows.filter(r => !this.isRowDisabled(r));
  }

  get selectableRowCount(): number {
    return this.selectableRows.length;
  }

  get isMasterCheckboxChecked(): boolean {
    return this.selectableRowCount > 0 && this.selectedRowIds.size === this.selectableRowCount;
  }

  get isMasterCheckboxIndeterminate(): boolean {
    return this.selectedRowIds.size > 0 && this.selectedRowIds.size < this.selectableRowCount;
  }

  isRowEditable(row: Record<string, any>): boolean {
    if (!row) return false;
    if (row['editable'] === false || String(row['editable']).toLowerCase() === 'false') {
      return false;
    }
    if (row['disabled'] === true || String(row['disabled']).toLowerCase() === 'true') {
      return false;
    }
    return true;
  }

  isRowDisabled(row: Record<string, any>): boolean {
    if (!row) return false;
    return row['disabled'] === true || String(row['disabled']).toLowerCase() === 'true';
  }

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
    { id: '4', first_name: 'Sophia', last_name: 'Bennett', email: 'sophia.bennett@enterprise.io', status: 'inactive', created_at: '2026-09-18 09:12 AM', editable: false },
    { id: '5', first_name: 'Noah', last_name: 'Carter', email: 'noah.carter@enterprise.io', status: 'active', created_at: '2026-09-20 04:55 PM' },
    { id: '6', first_name: 'Ava', last_name: 'Mitchell', email: 'ava.mitchell@enterprise.io', status: 'pending', created_at: '2026-09-22 01:20 PM', disabled: true },
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
            this.captureOriginalRowData();
            if (this.selectedRowIds.size > 0) {
              this.applyBulkEdits();
            }
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
    this.captureOriginalRowData();
    if (this.selectedRowIds.size > 0) {
      this.applyBulkEdits();
    }
  }

  // ── Column Adapter: Computes orders, freeze left offsets & widths ────
  private processColumns(): void {
    const list: EnrichedColumn[] = Object.keys(this.rawColumnConfig)
      .map(key => {
        const item = this.rawColumnConfig[key];
        return {
          ...item,
          key,
          active: item.active !== false && String(item.active) !== 'false',
          editable: item.editable === true || String(item.editable).toLowerCase() === 'true',
          computedWidth: item.width || '180px',
          isFrozen: !!(item.freez && item.freez.freez_side === 'left'),
        };
      })
      .sort((a, b) => a.order - b.order);

    this.recomputeColumnOffsets(list);
    this.allColumnsList = list;
    this.columnsList = list.filter(c => c.active !== false);
  }

  private recomputeColumnOffsets(list: EnrichedColumn[]): void {
    let currentLeftOffset = this.hasCheckboxColumn ? 50 : 0; // Checkbox column is 50px if active
    list.forEach(col => {
      if (col.isFrozen && col.active !== false) {
        col.stickyLeft = `${currentLeftOffset}px`;
        const widthPx = parseInt(col.computedWidth.replace('px', ''), 10) || 180;
        currentLeftOffset += widthPx;
      } else {
        col.stickyLeft = undefined;
      }
    });
  }

  // ── Action Panel Adapter: Splits pinned vs. section groups ───────────
  private processActions(): void {
    const actionsMap = this.rawActionPanelConfig.actions;
    const sectionsMap = this.rawActionPanelConfig.sections;

    const actionKeys = Object.keys(actionsMap);

    this.pinnedActions = actionKeys
      .filter(key => {
        const item = actionsMap[key];
        const isPinned = item.pinned === true || String(item.pinned) === 'true';
        const isActive = item.active === true || String(item.active) === 'true';
        return isPinned && isActive;
      })
      .map(key => ({ ...actionsMap[key], key }))
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return actionKeys.indexOf(a.key) - actionKeys.indexOf(b.key);
      });

    const sectionKeys = Object.keys(sectionsMap).sort(
      (a, b) => {
        if (sectionsMap[a].order !== sectionsMap[b].order) {
          return sectionsMap[a].order - sectionsMap[b].order;
        }
        return Object.keys(sectionsMap).indexOf(a) - Object.keys(sectionsMap).indexOf(b);
      }
    );

    this.sectionGroups = sectionKeys.map(sKey => {
      const section = sectionsMap[sKey];
      const items = actionKeys
        .filter(aKey => {
          const item = actionsMap[aKey];
          const isActive = item.active === true || String(item.active) === 'true';
          return item.section === sKey && isActive;
        })
        .map(aKey => ({ ...actionsMap[aKey], key: aKey }))
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return actionKeys.indexOf(a.key) - actionKeys.indexOf(b.key);
        });

      return {
        sectionKey: sKey,
        name: section.name,
        order: section.order,
        pinned: section.pinned === true || String(section.pinned) === 'true',
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
    this.isEditModeActive = !this.isEditModeActive;
    this.actionClicked.emit({ actionKey: 'edit', value: this.isEditModeActive });

    if (this.isEditModeActive) {
      if (this.selectedRowIds.size > 0) {
        this.showToast('Edit Mode Active', `Master edit filter opened for ${this.selectedRowIds.size} selected row(s)`, 'toolbar');
      } else {
        this.showToast('Edit Mode Active', 'Select row(s) or master checkbox to display master edit filter', 'toolbar');
      }
    } else {
      this.showToast('Edit Mode Closed', 'Master edit filter closed', 'toolbar');
    }
    this.cdr.markForCheck();
  }

  onEditToggle(editing?: boolean): void {
    if (editing !== undefined) {
      this.isEditModeActive = editing;
    } else {
      this.isEditModeActive = !this.isEditModeActive;
    }
    this.actionClicked.emit({ actionKey: 'edit', value: this.isEditModeActive });
    this.cdr.markForCheck();
  }

  onSaveClick(): void {
    if (!this.hasDirtyRows) {
      this.showToast('No Changes', 'No modified rows to save', 'toolbar');
      return;
    }

    const modified = this.modifiedRows;
    this.isSaving = true;

    // Emit event with modified rows and structured diffs
    this.actionClicked.emit({
      actionKey: 'save',
      value: {
        modifiedRows: modified.map(m => ({ ...m.row })),
        diffs: modified.map(m => ({ id: m.row['id'], diff: m.diff })),
        count: modified.length,
      },
    });

    // Commit baseline state into originalRowData and defaultMockRows
    modified.forEach(m => {
      const idStr = String(m.row['id']);
      this.originalRowData.set(idStr, { ...m.row });

      const mockRow = this.defaultMockRows.find(r => String(r['id']) === idStr);
      if (mockRow) {
        Object.assign(mockRow, m.row);
      }
    });

    this.sectionRowValues = {};
    this.isEditModeActive = false;
    this.isSaving = false;

    this.showToast('Changes Saved', `Successfully committed changes for ${modified.length} row(s)`, 'toolbar');
    this.cdr.markForCheck();
  }

  onRevertClick(): void {
    const count = this.dirtyRowCount;
    if (count === 0) {
      this.showToast('No Changes', 'No modified rows to revert', 'dropdown');
      return;
    }

    // Remove any unsaved copied rows
    this.rows = this.rows.filter(r => this.originalRowData.has(String(r['id'])));

    // Revert all editable columns of all rows to originalRowData baseline
    this.rows.forEach(row => {
      const orig = this.originalRowData.get(String(row['id']));
      if (orig) {
        Object.assign(row, orig);
      }
    });

    this.sectionRowValues = {};
    this.isEditModeActive = false;
    this.actionClicked.emit({ actionKey: 'revert', value: { count } });
    this.showToast('Changes Reverted', `Rolled back uncommitted changes for ${count} row(s)`, 'dropdown');
    this.cdr.markForCheck();
  }

  onCellValueChange(event: { key: string; value: any }): void {
    this.actionClicked.emit({ actionKey: 'cell_change', optionKey: event.key, value: event.value });
    this.cdr.markForCheck();
  }

  onLiveToggle(active?: boolean): void {
    this.isLiveFeedActive = active !== undefined ? active : !this.isLiveFeedActive;
    this.actionClicked.emit({ actionKey: 'live', value: this.isLiveFeedActive });
    this.showToast(this.isLiveFeedActive ? 'Live Feed Enabled' : 'Live Feed Paused', 'Live panel stream toggled', 'toolbar');
    this.cdr.markForCheck();
  }

  // ══════════════════════════════════════════════════════════════════════
  // THE 12 ACTIONS IMPLEMENTATION METHODS
  // ══════════════════════════════════════════════════════════════════════

  onCopySelectedRows(): void {
    if (!this.isIndividualRowSelectionActive) {
      this.showToast('Copy Unavailable', 'Select 1 or more individual rows (master level not allowed)', 'dropdown');
      return;
    }

    const copiedRows: Record<string, any>[] = [];
    this.selectedRowIds.forEach(id => {
      const target = this.rows.find(r => String(r['id']) === id);
      if (target) {
        const newId = `copy_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const copy: Record<string, any> = {
          ...target,
          id: newId,
          first_name: `${target['first_name'] || 'User'} (Copy)`,
        };
        copiedRows.push(copy);
      }
    });

    if (copiedRows.length === 0) return;

    this.rows = [...this.rows, ...copiedRows];
    this.defaultMockRows.push(...copiedRows);
    this.selectedRowIds.clear();
    copiedRows.forEach(r => this.selectedRowIds.add(String(r['id'])));

    this.actionClicked.emit({ actionKey: 'copy', value: copiedRows });
    this.showToast('Rows Copied', `Duplicated ${copiedRows.length} row(s). Click Save to commit changes.`, 'dropdown');
    this.cdr.markForCheck();
  }

  onEnableSelectedRows(): void {
    if (!this.isIndividualRowSelectionActive) {
      this.showToast('Enable Unavailable', 'Select 1 or more individual rows (master level not allowed)', 'dropdown');
      return;
    }

    let count = 0;
    this.selectedRowIds.forEach(id => {
      const target = this.rows.find(r => String(r['id']) === id);
      if (target) {
        target['status'] = 'active';
        target['disabled'] = false;
        count++;
      }
    });

    this.actionClicked.emit({ actionKey: 'enable', value: Array.from(this.selectedRowIds) });
    this.showToast('Rows Enabled', `Enabled ${count} row(s). Click Save to commit changes.`, 'dropdown');
    this.cdr.markForCheck();
  }

  onDisableSelectedRows(): void {
    if (!this.isIndividualRowSelectionActive) {
      this.showToast('Disable Unavailable', 'Select 1 or more individual rows (master level not allowed)', 'dropdown');
      return;
    }

    let count = 0;
    this.selectedRowIds.forEach(id => {
      const target = this.rows.find(r => String(r['id']) === id);
      if (target) {
        target['status'] = 'inactive';
        target['disabled'] = true;
        count++;
      }
    });

    this.actionClicked.emit({ actionKey: 'disable', value: Array.from(this.selectedRowIds) });
    this.showToast('Rows Disabled', `Disabled ${count} row(s). Click Save to commit changes.`, 'dropdown');
    this.cdr.markForCheck();
  }

  onDeleteSelectedRows(): void {
    if (!this.isIndividualRowSelectionActive) {
      this.showToast('Delete Unavailable', 'Select 1 or more individual rows (master level not allowed)', 'dropdown');
      return;
    }

    this.deleteTargetRowIds = Array.from(this.selectedRowIds);
    this.showDeleteConfirmModal = true;
    this.cdr.markForCheck();
  }

  confirmDeleteRows(): void {
    const toDeleteSet = new Set(this.deleteTargetRowIds);
    const count = toDeleteSet.size;

    this.rows = this.rows.filter(r => !toDeleteSet.has(String(r['id'])));
    for (let i = this.defaultMockRows.length - 1; i >= 0; i--) {
      if (toDeleteSet.has(String(this.defaultMockRows[i]['id']))) {
        this.defaultMockRows.splice(i, 1);
      }
    }
    toDeleteSet.forEach(id => {
      this.selectedRowIds.delete(id);
      this.originalRowData.delete(id);
    });

    this.showDeleteConfirmModal = false;
    this.deleteTargetRowIds = [];
    this.actionClicked.emit({ actionKey: 'delete', value: Array.from(toDeleteSet) });
    this.showToast('Rows Deleted', `Permanently deleted ${count} row(s)`, 'dropdown');
    this.cdr.markForCheck();
  }

  cancelDelete(): void {
    this.showDeleteConfirmModal = false;
    this.deleteTargetRowIds = [];
    this.cdr.markForCheck();
  }

  getRowDisplayName(id: string): string {
    const row = this.rows.find(r => String(r['id']) === id);
    if (!row) return '';
    return `${row['first_name'] || ''} ${row['last_name'] || ''}`.trim() || row['email'] || id;
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    this.actionClicked.emit({ actionKey: 'fullscreen', value: this.isFullscreen });
    this.showToast('Full Screen', this.isFullscreen ? 'Table expanded to full screen' : 'Table returned to normal view', 'dropdown');
    this.cdr.markForCheck();
  }

  toggleTableCollapse(): void {
    this.isTableCollapsed = !this.isTableCollapsed;
    this.actionClicked.emit({ actionKey: 'collapse', value: this.isTableCollapsed });
    this.showToast('Collapse', this.isTableCollapsed ? 'Table rows and pagination collapsed' : 'Table rows and pagination expanded', 'dropdown');
    this.cdr.markForCheck();
  }

  onResetAll(): void {
    this.activeFilters = {};
    this.sectionRowValues = {};
    this.selectedRowIds.clear();
    this.isMasterSelected = false;
    this.isEditModeActive = false;
    this.sortState = { first_name: 'asc' };

    // Revert unsaved edits to baseline
    this.rows.forEach(row => {
      const orig = this.originalRowData.get(String(row['id']));
      if (orig) {
        Object.assign(row, orig);
      }
    });

    this.processColumns();
    this.fetchTableData(1, this.pagination.limit);
    this.actionClicked.emit({ actionKey: 'reset' });
    this.showToast('Table Reset', 'Cleared all filters, bulk edits, sorting, columns, and selections', 'dropdown');
    this.cdr.markForCheck();
  }

  toggleColumnVisibility(colKey: string): void {
    const col = this.allColumnsList.find(c => c.key === colKey);
    if (!col) return;
    col.active = !col.active;
    if (this.rawColumnConfig[colKey]) {
      this.rawColumnConfig[colKey].active = col.active;
    }
    this.recomputeColumnOffsets(this.allColumnsList);
    this.columnsList = this.allColumnsList.filter(c => c.active !== false);
    this.showToast('Column Visibility', `Column "${col.header_name}" is now ${col.active ? 'visible' : 'hidden'}`, 'dropdown');
    this.actionClicked.emit({ actionKey: 'columns', optionKey: 'toggle', value: { colKey, active: col.active } });
    this.cdr.markForCheck();
  }

  reorderColumn(colKey: string, direction: 'up' | 'down'): void {
    const idx = this.allColumnsList.findIndex(c => c.key === colKey);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= this.allColumnsList.length) return;

    const [moved] = this.allColumnsList.splice(idx, 1);
    this.allColumnsList.splice(targetIdx, 0, moved);

    this.allColumnsList.forEach((c, i) => {
      c.order = i + 1;
      if (this.rawColumnConfig[c.key]) {
        this.rawColumnConfig[c.key].order = c.order;
      }
    });

    this.recomputeColumnOffsets(this.allColumnsList);
    this.columnsList = this.allColumnsList.filter(c => c.active !== false);
    this.showToast('Column Reordered', `Moved "${moved.header_name}" ${direction}`, 'dropdown');
    this.actionClicked.emit({ actionKey: 'columns', optionKey: 'reorder', value: { colKey, direction } });
    this.cdr.markForCheck();
  }

  resetColumns(): void {
    this.processColumns();
    this.showToast('Columns Reset', 'Column visibility and ordering restored', 'dropdown');
    this.actionClicked.emit({ actionKey: 'columns', optionKey: 'reset' });
    this.cdr.markForCheck();
  }

  scrollTableHorizontally(direction: 'left' | 'right' | 'start' | 'end'): void {
    this.tableComponent?.scrollTo(direction);
    this.actionClicked.emit({ actionKey: 'scroller', optionKey: direction });
  }

  onTableScrollProgress(pct: number): void {
    this.scrollPercentage = pct;
    this.cdr.markForCheck();
  }

  onTableScrollableChange(canScroll: boolean): void {
    this.isTableScrollable = canScroll;
    this.cdr.markForCheck();
  }

  onScrollerScroll(direction: 'left' | 'right'): void {
    this.scrollTableHorizontally(direction);
  }

  onClearMasterFilters(): void {
    this.sectionRowValues = {};
    this.applyBulkEdits();
    this.showToast('Master Filters Cleared', 'Cleared all master filter values and restored rows', 'toolbar');
    this.cdr.markForCheck();
  }

  onApplyMasterFilters(): void {
    const hasValues = Object.keys(this.sectionRowValues).some(
      k => this.sectionRowValues[k] !== undefined && this.sectionRowValues[k] !== ''
    );
    if (!hasValues) {
      this.showToast('No Filter Values', 'Enter values in master filter row before applying', 'toolbar');
      return;
    }
    this.applyBulkEdits();
    const count = this.selectedRowIds.size;
    this.showToast('Master Filters Applied', `Applied bulk edits across ${count} selected row(s). Click Save to commit.`, 'toolbar');
    this.cdr.markForCheck();
  }

  applySavedView(viewKey: string): void {
    if (viewKey === 'default_view' || viewKey === 'reset_view') {
      this.density = 'comfortable';
      this.activeFilters = {};
      this.sortState = { first_name: 'asc' };
      this.fetchTableData(1, this.pagination.limit);
      this.showToast('View: Default', 'Reset to default view configuration', 'dropdown');
    } else if (viewKey === 'compact_view') {
      this.density = 'compact';
      this.showToast('View: Compact', 'Applied compact density view', 'dropdown');
    } else if (viewKey === 'active_users') {
      this.activeFilters['status'] = 'active';
      this.fetchTableData(1, this.pagination.limit);
      this.showToast('View: Active Users', 'Filtered to active users', 'dropdown');
    } else if (viewKey === 'pending_users') {
      this.activeFilters['status'] = 'pending';
      this.fetchTableData(1, this.pagination.limit);
      this.showToast('View: Pending Review', 'Filtered to pending accounts', 'dropdown');
    } else if (viewKey === 'current_view') {
      this.showToast('View Saved', 'Current view configuration saved as preset', 'dropdown');
    }
    this.actionClicked.emit({ actionKey: 'view', optionKey: viewKey });
    this.cdr.markForCheck();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isFullscreen) {
      this.isFullscreen = false;
      this.cdr.markForCheck();
    }
    if (this.showDeleteConfirmModal) {
      this.cancelDelete();
    }
  }

  onActionPanelSelect(event: { actionKey: string; optionKey?: string }): void {
    if (event.actionKey === 'copy') {
      this.onCopySelectedRows();
      return;
    }
    if (event.actionKey === 'enable') {
      this.onEnableSelectedRows();
      return;
    }
    if (event.actionKey === 'disable') {
      this.onDisableSelectedRows();
      return;
    }
    if (event.actionKey === 'delete') {
      this.onDeleteSelectedRows();
      return;
    }
    if (event.actionKey === 'refresh') {
      this.bootstrapTable();
      return;
    }
    if (event.actionKey === 'density' && event.optionKey) {
      this.onDensityChange(event.optionKey as TableDensity);
      return;
    }
    if (event.actionKey === 'lock') {
      this.onLockToggle(!this.isLocked);
      return;
    }
    if (event.actionKey === 'edit') {
      this.onEditClick();
      return;
    }
    if (event.actionKey === 'save') {
      this.onSaveClick();
      return;
    }
    if (event.actionKey === 'revert') {
      this.onRevertClick();
      return;
    }
    if (event.actionKey === 'live') {
      this.onLiveToggle();
      return;
    }
    if (event.actionKey === 'reset') {
      this.onResetAll();
      return;
    }
    if (event.actionKey === 'fullscreen') {
      this.toggleFullscreen();
      return;
    }
    if (event.actionKey === 'collapse') {
      this.toggleTableCollapse();
      return;
    }
    if (event.actionKey === 'view') {
      this.applySavedView(event.optionKey || 'default_view');
      return;
    }
    if (event.actionKey === 'export') {
      this.actionClicked.emit({ actionKey: 'export', optionKey: event.optionKey });
      this.showToast('Export Initiated', `Format: ${event.optionKey || 'xlsx'}`, 'dropdown');
      return;
    }
    if (event.actionKey === 'download') {
      this.actionClicked.emit({ actionKey: 'download', optionKey: event.optionKey });
      this.showToast('Download Initiated', `Format: ${event.optionKey || 'xlsx'}`, 'dropdown');
      return;
    }
    this.actionClicked.emit({ actionKey: event.actionKey, optionKey: event.optionKey });
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

  private captureOriginalRowData(): void {
    this.originalRowData.clear();
    this.rows.forEach(r => {
      this.originalRowData.set(String(r['id']), { ...r });
    });
  }

  private applyBulkEdits(): void {
    this.rows.forEach(row => {
      const rowId = String(row['id']);
      const orig = this.originalRowData.get(rowId);
      if (!orig) return;

      const isSelected = this.selectedRowIds.has(rowId);
      const canEdit = this.isRowEditable(row);

      if (isSelected && canEdit) {
        // Apply values from sectionRowValues for editable columns
        this.columnsList.forEach(col => {
          if (col.editable) {
            const bulkVal = this.sectionRowValues[col.key];
            if (bulkVal !== undefined && bulkVal !== '') {
              row[col.key] = bulkVal;
            } else {
              row[col.key] = orig[col.key];
            }
          }
        });
      } else {
        // Row is excluded (unchecked) or not editable: restore baseline
        this.columnsList.forEach(col => {
          if (col.editable) {
            row[col.key] = orig[col.key];
          }
        });
      }
    });
    this.cdr.markForCheck();
  }

  onSectionRowChange(event: { col: EnrichedColumn; value: string }): void {
    const colKey = event.col.key;
    if (event.value !== undefined && event.value !== null && event.value !== '') {
      this.sectionRowValues[colKey] = event.value;
    } else {
      delete this.sectionRowValues[colKey];
    }
    this.applyBulkEdits();
    this.actionClicked.emit({ actionKey: 'section_row_change', optionKey: colKey, value: event.value });
    this.showToast(
      `Bulk Applied: ${event.col.header_name}`,
      event.value ? `"${event.value}" updated across ${this.selectedRowIds.size} row(s)` : 'Value cleared',
      'row'
    );
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
    if (this.isMasterCheckboxChecked) {
      this.selectedRowIds.clear();
      this.isMasterSelected = false;
      this.isEditModeActive = false;
      this.sectionRowValues = {};
      this.applyBulkEdits();
      this.showToast('Selection Cleared', 'All rows deselected (Master edit filter hidden)', 'header');
    } else {
      this.selectedRowIds.clear();
      this.selectableRows.forEach(r => this.selectedRowIds.add(String(r['id'])));
      this.isMasterSelected = true;
      this.applyBulkEdits();
      this.showToast('Master Selected', `${this.selectedRowIds.size} rows selected. Click Edit to open master edit filter.`, 'header');
    }
    this.selectionChange.emit(Array.from(this.selectedRowIds));
    this.cdr.markForCheck();
  }

  toggleRowSelect(e: MouseEvent, rowId: string): void {
    e.stopPropagation();
    const strId = String(rowId);
    const targetRow = this.rows.find(r => String(r['id']) === strId);
    if (targetRow && this.isRowDisabled(targetRow)) {
      return;
    }

    if (this.selectedRowIds.has(strId)) {
      this.selectedRowIds.delete(strId);
      this.showToast('Row Excluded', `Row ${strId} excluded from changes (restored original)`, 'row');
    } else {
      this.selectedRowIds.add(strId);
      this.showToast('Row Selected', `Row ${strId} selected. Click Edit to open master edit filter.`, 'row');
    }

    if (this.selectedRowIds.size === this.selectableRowCount && this.selectableRowCount > 0) {
      this.isMasterSelected = true;
    } else if (this.selectedRowIds.size === 0) {
      this.isMasterSelected = false;
      this.isEditModeActive = false;
      this.sectionRowValues = {};
    }

    this.applyBulkEdits();
    this.selectionChange.emit(Array.from(this.selectedRowIds));
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
