import { Component, OnInit, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Strict API Contracts Matching the 3 Configuration Payloads ───────────

export interface TableApiRegistry {
  paginated_data_api: string;
  data_api: string;
  create_api: string;
  create_bulk_api: string;
  create_all_api: string;
  create_import_api: string;
  update_api: string;
  update_bulk_api: string;
  update_all_api: string;
  update_import_api: string;
  delete_api: string;
  delete_bulk_api: string;
  delete_all_api: string;
  column_config_api: string;
  table_config_api: string;
  action_panel_config_api: string;
  table_lock_api: string;
  row_lock_api: string;
  lock_status_api: string;
  export_data_api: string;
  download_data_api: string;
  get_view_api: string;
  save_view_api: string;
  live_talk_api: string;
  live_listen_api: string;
}

export interface TableConfigPayload {
  table_key: string;
  display_name: string;
  add_data_button_name?: string;
  table_api: TableApiRegistry;
  show_title_header_section: boolean;
  enable_add_data_button: boolean;
  show_table_headers: boolean;
  enable_table_search_filters: boolean;
  editable_single_multiple_selected_rows: boolean;
  editable_all_rows: boolean;
  action_panel: boolean;
  action_column: {
    active: boolean;
    options: string[];
  };
  rows: {
    row_expansion: boolean;
    freez: boolean;
  };
  pagination: {
    active: boolean;
    default_page_size: number;
    page_size_options: number[];
  };
}

export interface FilterDataItem {
  key: string;
  name: string;
  type: string;
  default: boolean;
}

export interface ColumnFreezeConfig {
  freez_side: 'left' | 'right';
  order: number;
}

export interface ColumnConfigItem {
  header_name: string;
  filter_key: string;
  columns: Record<string, string>;
  order: number;
  filter_type: 'search' | 'multi_search' | 'list' | 'date_range' | string;
  editable: boolean;
  sorting: boolean;
  column_resize: boolean;
  info_note?: string;
  elipsis?: string;
  active: boolean;
  freez?: ColumnFreezeConfig;
  cell_mode: 'text_code_1000' | 'text_code_2000' | 'text_code_3100' | 'text_code_4000' | string;
  filter_data?: FilterDataItem[];
  width?: string;
}

export type ColumnConfigMap = Record<string, ColumnConfigItem>;

export interface ActionDropdownOption {
  display_name: string;
  info_note?: string;
}

export interface ActionItemConfig {
  name: string;
  component: string;
  active: boolean;
  info_note?: string;
  pinned?: boolean;
  section: string;
  order: number;
  dropdown_default_value?: string;
  dropdown_options?: Record<string, ActionDropdownOption>;
  dynamic_dropdown?: boolean;
}

export interface ActionSectionConfig {
  name: string;
  component: string;
  order: number;
}

export interface ActionPanelConfigPayload {
  sections: Record<string, ActionSectionConfig>;
  actions: Record<string, ActionItemConfig>;
}

// ── Enriched View Models for Component Rendering ──────────────────────────

export interface EnrichedColumn extends ColumnConfigItem {
  key: string;
  computedWidth: string;
  stickyLeft?: string;
  isFrozen: boolean;
}

export interface PinnedToolbarAction extends ActionItemConfig {
  key: string;
}

export interface SectionActionGroup {
  sectionKey: string;
  name: string;
  order: number;
  actions: Array<ActionItemConfig & { key: string }>;
}

export interface ToastMessage {
  id: number;
  title: string;
  detail?: string;
  source: 'header' | 'toolbar' | 'dropdown' | 'row' | 'filter' | 'pagination';
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  // ══════════════════════════════════════════════════════════════════════
  // RAW 100% CONFIGURATION PAYLOADS (From the 3 APIs)
  // ══════════════════════════════════════════════════════════════════════

  readonly tableConfig: TableConfigPayload = {
    table_key: 'users_table_1234',
    display_name: 'User Management',
    add_data_button_name: '+ Add User',
    table_api: {
      paginated_data_api: 'http://localhost:3000/identity/management/users',
      data_api: 'http://localhost:3000/identity/management/users/:id',
      create_api: 'http://localhost:3000/identity/management/users/create',
      create_bulk_api: 'http://localhost:3000/identity/management/users/create/bulk',
      create_all_api: 'http://localhost:3000/identity/management/users/create/all',
      create_import_api: 'http://localhost:3000/identity/management/users/create/import',
      update_api: 'http://localhost:3000/identity/management/users/update/:id',
      update_bulk_api: 'http://localhost:3000/identity/management/users/update/bulk',
      update_all_api: 'http://localhost:3000/identity/management/users/update/all',
      update_import_api: 'http://localhost:3000/identity/management/users/update/import',
      delete_api: 'http://localhost:3000/identity/management/users/delete/:id',
      delete_bulk_api: 'http://localhost:3000/identity/management/users/delete/bulk',
      delete_all_api: 'http://localhost:3000/identity/management/users/delete/all',
      column_config_api: 'http://localhost:3000/identity/management/users/config/columns',
      table_config_api: 'http://localhost:3000/identity/management/users/config/table',
      action_panel_config_api: 'http://localhost:3000/identity/management/users/config/actions',
      table_lock_api: 'http://localhost:3000/identity/management/lock/users/table',
      row_lock_api: 'http://localhost:3000/identity/management/lock/users/rows',
      lock_status_api: 'http://localhost:3000/identity/management/lock/users',
      export_data_api: 'http://localhost:3000/identity/management/export/users',
      download_data_api: 'http://localhost:3000/identity/management/download/users',
      get_view_api: 'http://localhost:3000/identity/management/view/users',
      save_view_api: 'http://localhost:3000/identity/management/view/users/save',
      live_talk_api: 'http://localhost:3000/identity/management/talk/users',
      live_listen_api: 'http://localhost:3000/identity/management/listen/users',
    },
    show_title_header_section: true,
    enable_add_data_button: true,
    show_table_headers: true,
    enable_table_search_filters: true,
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

  readonly rawColumnConfig: ColumnConfigMap = {
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

  readonly rawActionPanelConfig: ActionPanelConfigPayload = {
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
        info_note: '',
        pinned: true,
        section: 'section_2',
        order: 1,
      },
      lock: {
        name: 'Lock',
        active: true,
        component: 'lock_component',
        pinned: true,
        info_note: '',
        section: 'section_2',
        order: 2,
      },
      edit: {
        name: 'Edit',
        active: true,
        component: 'edit_component',
        pinned: true,
        info_note: '',
        section: 'section_1',
        order: 1,
      },
      save: {
        name: 'Save',
        active: true,
        component: 'save_component',
        pinned: true,
        info_note: '',
        section: 'section_1',
        order: 2,
      },
      delete: {
        name: 'Delete',
        active: true,
        component: 'delete_component',
        info_note: '',
        section: 'section_1',
        order: 3,
      },
      enable: {
        name: 'Enable',
        active: true,
        component: 'enable_component',
        info_note: '',
        section: 'section_1',
        order: 4,
      },
      disable: {
        name: 'Disable',
        active: true,
        component: 'disable_component',
        info_note: '',
        section: 'section_1',
        order: 5,
      },
      revert: {
        name: 'Revert',
        active: true,
        component: 'revert_component',
        info_note: '',
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

  // Dropdown States
  actionsMenuOpen = false;
  activeSubmenuKey: string | null = null;
  activeFilterDropdownKey: string | null = null;
  activeRowActionId: string | null = null;

  // Selected density state
  selectedDensity: 'compact' | 'comfortable' | 'spacious' = 'comfortable';

  // Floating Toast Stack
  toasts: ToastMessage[] = [];
  private toastCounter = 0;

  // Mock Rows (conforming strictly to the column schema)
  readonly mockRows: Record<string, any>[] = [
    {
      id: 'usr_001',
      first_name: 'Liam',
      last_name: 'Walker',
      email: 'liam.walker@enterprise.io',
      status: 'active',
      created_at: '2026-09-12 10:45 AM',
    },
    {
      id: 'usr_002',
      first_name: 'Olivia',
      last_name: 'Brooks',
      email: 'olivia.brooks@enterprise.io',
      status: 'pending',
      created_at: '2026-09-14 02:18 PM',
    },
    {
      id: 'usr_003',
      first_name: 'Ethan',
      last_name: 'Hayes',
      email: 'ethan.hayes@enterprise.io',
      status: 'active',
      created_at: '2026-09-16 11:30 AM',
    },
    {
      id: 'usr_004',
      first_name: 'Sophia',
      last_name: 'Bennett',
      email: 'sophia.bennett@enterprise.io',
      status: 'inactive',
      created_at: '2026-09-18 09:12 AM',
    },
    {
      id: 'usr_005',
      first_name: 'Noah',
      last_name: 'Carter',
      email: 'noah.carter@enterprise.io',
      status: 'active',
      created_at: '2026-09-20 04:55 PM',
    },
    {
      id: 'usr_006',
      first_name: 'Ava',
      last_name: 'Mitchell',
      email: 'ava.mitchell@enterprise.io',
      status: 'pending',
      created_at: '2026-09-22 01:20 PM',
    },
    {
      id: 'usr_007',
      first_name: 'Lucas',
      last_name: 'Sullivan',
      email: 'lucas.sullivan@enterprise.io',
      status: 'active',
      created_at: '2026-09-24 08:40 AM',
    },
    {
      id: 'usr_008',
      first_name: 'Mia',
      last_name: 'Reynolds',
      email: 'mia.reynolds@enterprise.io',
      status: 'inactive',
      created_at: '2026-09-26 03:15 PM',
    },
  ];

  selectedRowIds = new Set<string>();

  ngOnInit(): void {
    this.processColumns();
    this.processActions();
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

    // Compute cumulative sticky left offsets
    // Checkbox column has width 50px
    let currentLeftOffset = 50;
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

    // 1. Pinned Toolbar Actions (sorted by order)
    this.pinnedActions = Object.keys(actionsMap)
      .filter(key => actionsMap[key].pinned === true && actionsMap[key].active === true)
      .map(key => ({ ...actionsMap[key], key }))
      .sort((a, b) => a.order - b.order);

    // 2. Sections with Non-Pinned Actions
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

  // ── Global Document Click Listener (Closes popovers) ─────────────────
  @HostListener('document:click')
  onDocumentClick(): void {
    this.actionsMenuOpen = false;
    this.activeSubmenuKey = null;
    this.activeFilterDropdownKey = null;
    this.activeRowActionId = null;
    this.cdr.markForCheck();
  }

  // ── Floating Toast System (Non-destructive) ──────────────────────────
  showToast(
    title: string,
    detail?: string,
    source: ToastMessage['source'] = 'toolbar'
  ): void {
    const id = ++this.toastCounter;
    const toast: ToastMessage = { id, title, detail, source };
    this.toasts.unshift(toast);

    if (this.toasts.length > 4) {
      this.toasts.pop();
    }
    this.cdr.markForCheck();

    setTimeout(() => {
      this.dismissToast(id);
    }, 3200);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }

  // ── User Interaction Handlers ────────────────────────────────────────

  onHeaderAddDataClick(): void {
    const label = this.tableConfig.add_data_button_name || '+ Add Record';
    this.showToast(
      `${label} Clicked`,
      `Table Config API: ${this.tableConfig.table_api.create_api}`,
      'header'
    );
  }

  onPinnedActionClick(action: PinnedToolbarAction): void {
    this.showToast(
      `[Toolbar Action] ${action.name}`,
      `Component: ${action.component} (Section: ${action.section})`,
      'toolbar'
    );
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
    this.showToast(
      `[Actions Menu] ${action.name}`,
      `Component: ${action.component} (Order: ${action.order})`,
      'dropdown'
    );
  }

  onSubOptionClick(
    e: MouseEvent,
    action: ActionItemConfig & { key: string },
    optKey: string,
    opt: ActionDropdownOption
  ): void {
    e.stopPropagation();
    this.actionsMenuOpen = false;
    this.activeSubmenuKey = null;

    if (action.key === 'density') {
      this.selectedDensity = optKey as 'compact' | 'comfortable' | 'spacious';
    }

    this.showToast(
      `[${action.name}] Selected: ${opt.display_name}`,
      opt.info_note ? `Note: ${opt.info_note}` : `Config Key: ${optKey}`,
      'dropdown'
    );
  }

  toggleFilterDropdown(e: MouseEvent, colKey: string): void {
    e.stopPropagation();
    this.activeFilterDropdownKey = this.activeFilterDropdownKey === colKey ? null : colKey;
    this.cdr.markForCheck();
  }

  onFilterItemClick(e: MouseEvent, col: EnrichedColumn, item: FilterDataItem): void {
    e.stopPropagation();
    this.showToast(
      `[Filter] Column "${col.header_name}"`,
      `Filter Option: ${item.name} (${item.key})`,
      'filter'
    );
  }

  onSearchInput(col: EnrichedColumn, value: string): void {
    if (value.trim()) {
      this.showToast(
        `[Search] Column "${col.header_name}"`,
        `Filter Type: ${col.filter_type} | Query: "${value}"`,
        'filter'
      );
    }
  }

  sortState: Record<string, 'asc' | 'desc' | null> = { first_name: 'asc' };

  onHeaderSortClick(col: EnrichedColumn): void {
    if (!col.sorting) return;
    const current = this.sortState[col.key];
    const next: 'asc' | 'desc' | null = current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc';
    this.sortState[col.key] = next;
    this.showToast(
      `[Sort] Column "${col.header_name}"`,
      next ? `Direction: ${next.toUpperCase()}` : 'Sort cleared',
      'header'
    );
    this.cdr.markForCheck();
  }

  toggleRowActionMenu(e: MouseEvent, rowId: string): void {
    e.stopPropagation();
    this.activeRowActionId = this.activeRowActionId === rowId ? null : rowId;
    this.cdr.markForCheck();
  }

  onRowActionClick(e: MouseEvent, optionKey: string, row: Record<string, any>): void {
    e.stopPropagation();
    this.activeRowActionId = null;
    this.showToast(
      `[Row Action] "${optionKey}"`,
      `Target Row: ${row['first_name']} ${row['last_name']} (ID: ${row['id']})`,
      'row'
    );
  }

  toggleSelectAll(): void {
    if (this.selectedRowIds.size === this.mockRows.length) {
      this.selectedRowIds.clear();
      this.showToast(`Selection Cleared`, `All rows deselected`, 'header');
    } else {
      this.mockRows.forEach(r => this.selectedRowIds.add(r['id']));
      this.showToast(`Selected All Rows`, `${this.mockRows.length} rows selected`, 'header');
    }
    this.cdr.markForCheck();
  }

  toggleRowSelect(e: MouseEvent, rowId: string): void {
    e.stopPropagation();
    if (this.selectedRowIds.has(rowId)) {
      this.selectedRowIds.delete(rowId);
    } else {
      this.selectedRowIds.add(rowId);
    }
    this.showToast(
      `Row Selection Changed`,
      `${this.selectedRowIds.size} row(s) currently selected`,
      'row'
    );
    this.cdr.markForCheck();
  }

  isBottomRow(index: number): boolean {
    return index >= Math.floor(this.mockRows.length / 2);
  }

  onPaginationChange(type: 'page' | 'limit', val: number): void {
    this.showToast(
      `[Pagination] ${type === 'page' ? 'Page Navigation' : 'Page Size Changed'}`,
      `Set ${type} to: ${val}`,
      'pagination'
    );
  }
}
