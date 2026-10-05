import { Component, OnInit, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Nexora Official Master Table Components ───────────────────────────
import {
  DataTable,
  TableSaveRequest,
  TableBulkActionRequest
} from '../../../components/data-table/table/data-table';

// Table level
import {
  ToolbarActions,
  FilterRow,
  CollabBar,
  TablePagination,
  AutoRefreshComponent,
  DensityComponent,
  ExportActionComponent,
  DownloadActionComponent,
  ColumnsManagerComponent,
  ColumnNavComponent,
  ViewsManagerComponent,
  FullscreenToggleComponent,
  CollapseToggleComponent,
  CollabToggleComponent,
  ActionButtonComponent
} from '../../../components/data-table/table';
import { ActionMenuComponent, ActionMenuItem } from '../../../components/data-table/table/action-menu';

// Column level
import { ColumnHeader, SortDirection } from '../../../components/data-table/column/header';
import { SelectionColumn } from '../../../components/data-table/column/selection';
import { ActionColumn, RowAction } from '../../../components/data-table/column/action';

// Row level (The 4 core row states)
import {
  ReadonlyRow,
  EditableRow,
  DisabledRow,
  UnavailableRow
} from '../../../components/data-table/row';

// Cell level (Atomic presentation units)
import {
  StatusBadgeCell,
  FlagAndPlainText,
  NumberSeparationWithComma,
  ImageAndPlainText,
  PlainTextCell,
  EditableCell,
  ReadonlyCell,
  DisabledCell,
  UnavailableCell
} from '../../../components/data-table/cell';

import type { ColumnDef, PaginationState, SortState, FilterValues, CollabUser } from '../../../components/data-table/models/column-def.model';
import type { TableConfigEntry } from '../../../components/data-table/models/table-config.model';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Table orchestrator
    DataTable,
    // Table level
    ToolbarActions,
    FilterRow,
    CollabBar,
    TablePagination,
    AutoRefreshComponent,
    DensityComponent,
    ExportActionComponent,
    DownloadActionComponent,
    ColumnsManagerComponent,
    ColumnNavComponent,
    ViewsManagerComponent,
    FullscreenToggleComponent,
    CollapseToggleComponent,
    CollabToggleComponent,
    ActionButtonComponent,
    ActionMenuComponent,
    // Column level
    ColumnHeader,
    SelectionColumn,
    ActionColumn,
    // Row level
    ReadonlyRow,
    EditableRow,
    DisabledRow,
    UnavailableRow,
    // Cell level
    StatusBadgeCell,
    FlagAndPlainText,
    NumberSeparationWithComma,
    ImageAndPlainText,
    PlainTextCell,
    EditableCell,
    ReadonlyCell,
    DisabledCell,
    UnavailableCell
  ],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  // Top view switcher: Dissected Anatomy vs. Assembled Master Table
  viewMode: 'dissected-components' | 'assembled-table' = 'dissected-components';

  // Active filter chip in dissected view
  activeDissectionLayer:
    | 'all'
    | 'header'
    | 'toolbar'
    | 'collab'
    | 'columns'
    | 'filter'
    | 'master-edit'
    | 'rows'
    | 'actions'
    | 'cells'
    | 'pagination' = 'all';

  // Live action status ticker
  lastActionMessage = 'Nexora Master Table architecture ready. Select any dissected component to explore.';

  // ══════════════════════════════════════════════════════════════════════
  // DISSECTED SHOWCASE STATE
  // ══════════════════════════════════════════════════════════════════════
  dissectedDensity: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  dissectedFilterValues: FilterValues = {};
  dissectedSorts: Record<string, SortDirection> = { customer_name: 'asc', revenue: 'desc' };
  dissectedMasterEditValues: Record<string, string> = { customer_name: 'Global Corp Batch', status: 'ACTIVE' };
  dissectedSelectedCount = 1;
  dissectedMasterAllSelected = false;
  dissectedPagination: PaginationState = { page: 1, limit: 10, total: 48, totalPages: 5 };
  dissectedEditableCellVal = 'Acme Global Ltd';
  dissectedEditableNumberVal = 4500000;
  dissectedSelectedStatus = 'ACTIVE';

  // Dissected sample rows representing the 4 row state resolutions
  sampleReadonlyRow: any = {
    id: 'ro_1',
    customer_name: 'Acme Corporation',
    email: 'acme@corp.com',
    status: 'ACTIVE',
    registration_date: '12 Sep 2026',
    country: 'India',
    flag: '🇮🇳',
    revenue: 50000000,
    industry: 'Fintech',
    owner: 'John Doe',
    readonly: true
  };

  sampleEditableRow: any = {
    id: 'ed_1',
    customer_name: 'Globex Holdings',
    email: 'info@globex.com',
    status: 'PENDING',
    registration_date: '14 Sep 2026',
    country: 'Germany',
    flag: '🇩🇪',
    revenue: 23000000,
    industry: 'SaaS',
    owner: 'Sarah Connor',
    readonly: false
  };

  sampleDisabledRow: any = {
    id: 'dis_1',
    customer_name: 'Cyberdyne Systems (Disabled)',
    email: 'neural@cyberdyne.de',
    status: 'INACTIVE',
    registration_date: '02 Sep 2026',
    country: 'Germany',
    flag: '🇩🇪',
    revenue: 9500000,
    industry: 'Fintech',
    owner: 'Miles Dyson',
    disabled: true
  };

  sampleUnavailableRow: any = {
    id: 'err_1',
    customer_name: 'Umbrella Inc (Validation Error)',
    email: 'contact@umbrella.com',
    status: 'PENDING',
    registration_date: '16 Sep 2026',
    country: 'USA',
    flag: '🇺🇸',
    revenue: 12000000,
    industry: 'Healthcare',
    owner: 'Michael Kim',
    rowState: 'error',
    errorCells: ['revenue', 'status']
  };

  sampleWarningRow: any = {
    id: 'warn_1',
    customer_name: 'Stark Industries (Warning State)',
    email: 'admin@stark.com',
    status: 'ACTIVE',
    registration_date: '10 Sep 2026',
    country: 'USA',
    flag: '🇺🇸',
    revenue: 85000000,
    industry: 'Manufacturing',
    owner: 'Tony Stark',
    rowState: 'warning',
    warningCells: ['revenue']
  };

  // Demo menu items for action-menu component
  demoMenuItems: ActionMenuItem[] = [
    { key: 'refresh', label: 'Refresh Table', icon: '↻' },
    { key: 'lock', label: 'Lock Table', icon: '🔒' },
    { key: 'export', label: 'Export Data', icon: '📥' },
    { key: 'density', label: 'Change Density', icon: '≈' },
    { key: 'audit', label: 'View Audit Log', icon: '📋' }
  ];

  // ══════════════════════════════════════════════════════════════════════
  // ASSEMBLED MASTER TABLE STATE
  // ══════════════════════════════════════════════════════════════════════
  columns: ColumnDef[] = [];
  rows: any[] = [];
  allMockRows: any[] = [];
  tableConfig: TableConfigEntry | null = null;
  pagination: PaginationState = { page: 1, limit: 10, total: 12, totalPages: 2 };
  sorts: SortState[] = [];
  filterValues: FilterValues = {};
  loading = false;

  actionsOpen = false;
  actionsDropTop = 0;
  actionsDropRight = 0;

  // Real-time Collaboration Users
  readonly collabUsers: CollabUser[] = [
    { id: 'u1', name: 'Sarah Connor', initials: 'SC', color: 'bg-violet-100', textColor: 'text-violet-700', isViewing: true, isEditing: true },
    { id: 'u2', name: 'John Doe', initials: 'JD', color: 'bg-indigo-100', textColor: 'text-indigo-700', isViewing: true, isEditing: false }
  ];

  ngOnInit(): void {
    this.initTableConfiguration();
    this.initMockDataset();
    this.applyClientSideQuery();
  }

  toggleActionsMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.actionsOpen = !this.actionsOpen;
    this.cdr.markForCheck();
  }

  @HostListener('document:click')
  onDocClick(): void {
    if (this.actionsOpen) {
      this.actionsOpen = false;
      this.cdr.markForCheck();
    }
  }

  logAction(msg: string): void {
    this.lastActionMessage = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.cdr.markForCheck();
  }

  frozenOffset(col: ColumnDef): string {
    if (!col?.frozen) return '0px';
    return col.frozenSide === 'left' ? '54px' : '0px';
  }

  // ── Row Action Builder ──────────────────────────────────────────────
  buildDissectedRowActions(row: any): RowAction[] {
    const isErr = row.rowState === 'error';
    const isDis = !!row.disabled;
    return [
      { key: 'edit', label: 'Edit row', icon: '✎', requiresEditable: !isDis },
      { key: 'delete', label: 'Delete row', icon: '🗑', requiresDeletable: true },
      { key: 'revert', label: 'Revert row', icon: '↶' },
      { key: 'audit', label: isErr ? 'Inspect error details' : 'Audit record', icon: isErr ? '⚠' : '◉' }
    ];
  }

  // ── Dissected Interactive Handlers ──────────────────────────────────
  onDissectedDensityChange(d: 'compact' | 'comfortable' | 'spacious'): void {
    this.dissectedDensity = d;
    this.logAction(`Dissected density set to: ${d}`);
  }

  onDissectedSort(colKey: string, dir: SortDirection): void {
    this.dissectedSorts[colKey] = dir;
    this.logAction(`Dissected sort: "${colKey}" -> ${dir ?? 'none'}`);
  }

  onDissectedFilterChange(f: FilterValues): void {
    this.dissectedFilterValues = { ...f };
    this.logAction(`Dissected filter changed: ${JSON.stringify(f)}`);
  }

  onDissectedFilterClear(): void {
    this.dissectedFilterValues = {};
    this.logAction('Dissected filter cleared');
  }

  onDissectedMasterSelect(checked: boolean): void {
    this.dissectedMasterAllSelected = checked;
    this.dissectedSelectedCount = checked ? 4 : 0;
    this.logAction(`Dissected master selection: ${checked ? 'Selected all' : 'Deselected all'}`);
  }

  onDissectedCellChange(e: { key: string; value: any }): void {
    this.sampleEditableRow[e.key] = e.value;
    this.logAction(`Editable row field "${e.key}" updated to: "${e.value}"`);
  }

  onDissectedMasterEditChange(key: string, val: string): void {
    this.dissectedMasterEditValues[key] = val;
    this.sampleEditableRow[key] = val;
    this.logAction(`Master edit broadcast "${key}": "${val}"`);
  }

  onDissectedPageChange(page: number): void {
    this.dissectedPagination = { ...this.dissectedPagination, page };
    this.logAction(`Dissected pagination page changed to: ${page}`);
  }

  onDissectedPageSizeChange(limit: number): void {
    this.dissectedPagination = { ...this.dissectedPagination, limit, page: 1 };
    this.logAction(`Dissected pagination page size changed to: ${limit}`);
  }

  // ── Initialize Master Table Configuration & Columns ─────────────────
  private initTableConfiguration(): void {
    this.tableConfig = {
      table_name: 'enterprise_customers',
      display_name: 'Customers',
      data_api: '/customers',
      update_api: '/customers/update',
      config_api: '/customers/config',
      table_config_api: '/customers/table-config',
      primary_key: 'id',
      show_checkboxes: true,
      show_actions: true,
      show_headers: true,
      live_count_panel: true,
      main_action_panel: true,
      fixed_checkboxes: true,
      fixed_actions: true,
      selection: { enabled: true, multiple: true },
      pagination: { enabled: true, default_page_size: 10, page_size_options: [5, 10, 25, 50] },
      sorting: { enabled: true, multiple: true },
      filtering: { enabled: true },
      editing: { enabled: true, row_editable: true },
      actions: { edit: true, delete: true, enable: true, disable: true, revert: true, more: true },
      export: { enabled: true, formats: ['excel', 'csv'] },
      download: { enabled: true, formats: ['excel', 'csv'] },
      column_management: { enabled: true, reorder: true, show_hide: true },
      column_freeze: { enabled: true, start: 1, end: 0 },
      row_freeze: { enabled: false, top: 0, bottom: 0 },
      column_resize: { enabled: true },
      view: { fullscreen: true, density: true, default_density: 'comfortable' },
      live_collaboration: { enabled: true },
      features: { column_navigation: true, column_count_indicator: true, save_view: true, reset_view: true }
    };

    this.columns = [
      {
        key: 'customer_name',
        label: 'Customer Name',
        infoNote: 'Primary customer name with contact email',
        width: '260px',
        minWidth: '200px',
        maxWidth: '400px',
        defaultWidth: '260px',
        format: 'avatar',
        ellipsis: 'text_elipsis',
        secondaryKey: 'email',
        visible: true,
        sortable: true,
        filterable: true,
        editable: true,
        resizable: true,
        frozen: true,
        frozenSide: 'left',
        required: true,
        masterEditAllow: true,
        filterType: 'search',
        filterData: [],
        order: 0
      },
      {
        key: 'status',
        label: 'Status',
        infoNote: 'Current account activation status',
        width: '150px',
        minWidth: '120px',
        maxWidth: '220px',
        defaultWidth: '150px',
        format: 'status',
        ellipsis: 'text_elipsis',
        visible: true,
        sortable: true,
        filterable: true,
        editable: true,
        resizable: true,
        frozen: false,
        required: true,
        masterEditAllow: true,
        filterType: 'list',
        filterData: [
          { key: 'ACTIVE', name: 'Active', type: 'check_box', default: false },
          { key: 'PENDING', name: 'Pending', type: 'check_box', default: false },
          { key: 'INACTIVE', name: 'Inactive', type: 'check_box', default: false }
        ],
        order: 1
      },
      {
        key: 'registration_date',
        label: 'Registration Date',
        infoNote: 'Account onboarding date',
        width: '180px',
        minWidth: '140px',
        maxWidth: '240px',
        defaultWidth: '180px',
        format: 'date',
        ellipsis: 'text_elipsis',
        visible: true,
        sortable: true,
        filterable: true,
        editable: false,
        resizable: true,
        frozen: false,
        required: false,
        masterEditAllow: false,
        filterType: 'date_range',
        filterData: [],
        order: 2
      },
      {
        key: 'country',
        label: 'Country',
        infoNote: 'Headquarters jurisdiction',
        width: '160px',
        minWidth: '120px',
        maxWidth: '220px',
        defaultWidth: '160px',
        format: 'flag',
        ellipsis: 'text_elipsis',
        visible: true,
        sortable: true,
        filterable: true,
        editable: true,
        resizable: true,
        frozen: false,
        required: false,
        masterEditAllow: true,
        filterType: 'search',
        filterData: [],
        order: 3
      },
      {
        key: 'revenue',
        label: 'Revenue',
        infoNote: 'Annual contract value',
        width: '170px',
        minWidth: '130px',
        maxWidth: '250px',
        defaultWidth: '170px',
        format: 'number',
        prefix: '₹',
        decimals: 0,
        ellipsis: 'number_elipsis',
        visible: true,
        sortable: true,
        filterable: true,
        editable: true,
        resizable: true,
        frozen: false,
        required: false,
        masterEditAllow: true,
        filterType: 'range',
        filterData: [],
        order: 4
      },
      {
        key: 'industry',
        label: 'Industry',
        infoNote: 'Business domain categorization',
        width: '150px',
        minWidth: '120px',
        maxWidth: '220px',
        defaultWidth: '150px',
        format: 'text',
        ellipsis: 'text_elipsis',
        visible: true,
        sortable: true,
        filterable: true,
        editable: true,
        resizable: true,
        frozen: false,
        required: false,
        masterEditAllow: true,
        filterType: 'search',
        filterData: [],
        order: 5
      },
      {
        key: 'owner',
        label: 'Account Owner',
        infoNote: 'Assigned relationship manager',
        width: '160px',
        minWidth: '120px',
        maxWidth: '240px',
        defaultWidth: '160px',
        format: 'text',
        ellipsis: 'text_elipsis',
        visible: true,
        sortable: true,
        filterable: true,
        editable: true,
        resizable: true,
        frozen: false,
        required: false,
        masterEditAllow: true,
        filterType: 'search',
        filterData: [],
        order: 6
      }
    ];
  }

  // ── Initialize Rich Enterprise Mock Data ────────────────────────────
  private initMockDataset(): void {
    this.allMockRows = [
      {
        id: 'usr_001',
        customer_name: 'Acme Corporation',
        email: 'acme@corp.com',
        status: 'ACTIVE',
        registration_date: '12 Sep 2026',
        country: 'India',
        flag: '🇮🇳',
        revenue: 50000000,
        industry: 'Fintech',
        owner: 'John Doe'
      },
      {
        id: 'usr_002',
        customer_name: 'Globex Holdings',
        email: 'info@globex.com',
        status: 'PENDING',
        registration_date: '14 Sep 2026',
        country: 'Germany',
        flag: '🇩🇪',
        revenue: 23000000,
        industry: 'SaaS',
        owner: 'Sarah Connor'
      },
      {
        id: 'usr_003',
        customer_name: 'Umbrella Inc',
        email: 'contact@umbrella.com',
        status: 'ACTIVE',
        registration_date: '16 Sep 2026',
        country: 'USA',
        flag: '🇺🇸',
        revenue: 12000000,
        industry: 'Healthcare',
        owner: 'Michael Kim'
      },
      {
        id: 'usr_004',
        customer_name: 'Stark Industries',
        email: 'admin@stark.com',
        status: 'PENDING',
        registration_date: '10 Sep 2026',
        country: 'USA',
        flag: '🇺🇸',
        revenue: 85000000,
        industry: 'Manufacturing',
        owner: 'Tony Stark'
      },
      {
        id: 'usr_005',
        customer_name: 'Wayne Corp',
        email: 'wayne@corp.com',
        status: 'ACTIVE',
        registration_date: '08 Sep 2026',
        country: 'UK',
        flag: '🇬🇧',
        revenue: 34000000,
        industry: 'Energy',
        owner: 'Bruce Wayne'
      },
      {
        id: 'usr_006',
        customer_name: 'Cyberdyne Systems',
        email: 'neural@cyberdyne.de',
        status: 'INACTIVE',
        registration_date: '02 Sep 2026',
        country: 'Germany',
        flag: '🇩🇪',
        revenue: 9500000,
        industry: 'Fintech',
        owner: 'Miles Dyson'
      },
      {
        id: 'usr_007',
        customer_name: 'Initech Software',
        email: 'peter@initech.com',
        status: 'ACTIVE',
        registration_date: '18 Aug 2026',
        country: 'USA',
        flag: '🇺🇸',
        revenue: 8400000,
        industry: 'SaaS',
        owner: 'Peter Gibbons'
      },
      {
        id: 'usr_008',
        customer_name: 'Hooli Cloud Corp',
        email: 'gavin@hooli.com',
        status: 'PENDING',
        registration_date: '24 Aug 2026',
        country: 'USA',
        flag: '🇺🇸',
        revenue: 42000000,
        industry: 'SaaS',
        owner: 'Gavin Belson'
      },
      {
        id: 'usr_009',
        customer_name: 'Pied Piper Networks',
        email: 'richard@piedpiper.com',
        status: 'ACTIVE',
        registration_date: '30 Aug 2026',
        country: 'Singapore',
        flag: '🇸🇬',
        revenue: 16500000,
        industry: 'Fintech',
        owner: 'Richard Hendricks'
      },
      {
        id: 'usr_010',
        customer_name: 'Oscorp Chemical',
        email: 'norman@oscorp.com',
        status: 'INACTIVE',
        registration_date: '15 Jul 2026',
        country: 'USA',
        flag: '🇺🇸',
        revenue: 6800000,
        industry: 'Healthcare',
        owner: 'Norman Osborn'
      },
      {
        id: 'usr_011',
        customer_name: 'Wonka Confections',
        email: 'willy@wonka.uk',
        status: 'ACTIVE',
        registration_date: '01 Jul 2026',
        country: 'UK',
        flag: '🇬🇧',
        revenue: 29000000,
        industry: 'Manufacturing',
        owner: 'Charlie Bucket'
      },
      {
        id: 'usr_012',
        customer_name: 'Massive Dynamic Labs',
        email: 'nina@massivedynamic.com',
        status: 'PENDING',
        registration_date: '19 Jun 2026',
        country: 'Singapore',
        flag: '🇸🇬',
        revenue: 18400000,
        industry: 'Healthcare',
        owner: 'Nina Sharp'
      }
    ];
  }

  // ── Client-Side Query: Filter, Sort & Paginate Mock Dataset ─────────
  private applyClientSideQuery(): void {
    let result = [...this.allMockRows];

    // 1. Filtering
    Object.keys(this.filterValues).forEach(key => {
      const filterVal = this.filterValues[key];
      if (filterVal !== undefined && filterVal !== null && filterVal !== '') {
        const valStr = String(filterVal).toLowerCase();
        result = result.filter(r => {
          const itemVal = String(r[key] ?? '').toLowerCase();
          return itemVal.includes(valStr);
        });
      }
    });

    // 2. Sorting
    if (this.sorts.length > 0) {
      const { key, direction } = this.sorts[0];
      result.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 3. Pagination calculations
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pagination.limit));
    const page = Math.min(this.pagination.page, totalPages);
    const startIndex = (page - 1) * this.pagination.limit;
    const pagedRows = result.slice(startIndex, startIndex + this.pagination.limit);

    this.rows = pagedRows;
    this.pagination = {
      page,
      limit: this.pagination.limit,
      total,
      totalPages
    };
    this.cdr.markForCheck();
  }

  // ── Master Table Event Listeners ────────────────────────────────────
  onPageChange(page: number): void {
    this.pagination.page = page;
    this.applyClientSideQuery();
    this.logAction(`Page changed to ${page}`);
  }

  onPageSizeChange(limit: number): void {
    this.pagination.limit = limit;
    this.pagination.page = 1;
    this.applyClientSideQuery();
    this.logAction(`Rows per page set to ${limit}`);
  }

  onSortChange(s: SortState[]): void {
    this.sorts = s;
    this.applyClientSideQuery();
    if (s.length > 0) {
      this.logAction(`Sorted by ${s[0].key} (${s[0].direction?.toUpperCase()})`);
    } else {
      this.logAction('Sort cleared');
    }
  }

  onFilterChange(v: FilterValues): void {
    this.filterValues = { ...v };
    this.pagination.page = 1;
    this.applyClientSideQuery();
    this.logAction(`Filter applied on ${Object.keys(v).length} column(s)`);
  }

  onColumnsChanged(c: ColumnDef[]): void {
    this.columns = [...c];
    this.logAction(`Column configuration updated (${c.filter(col => col.visible).length} visible)`);
  }

  onSelectionChange(selectedIds: string[]): void {
    this.logAction(`Selection changed: ${selectedIds.length} row(s) selected`);
  }

  onCellChanged(e: { rowId: string; key: string; value: any }): void {
    if (e.key === '__revert__') return;
    const row = this.allMockRows.find(r => r.id === e.rowId);
    if (row) {
      row[e.key] = e.value;
      this.applyClientSideQuery();
      this.logAction(`Cell updated: ${e.key} = "${e.value}" for ${row.customer_name}`);
    }
  }

  onSave(request: TableSaveRequest): void {
    this.logAction(`Saved changes (${request.mode} mode) successfully`);
  }

  onBulkAction(request: TableBulkActionRequest): void {
    if (request.action === 'enable' || request.action === 'disable') {
      const newStatus = request.action === 'enable' ? 'ACTIVE' : 'INACTIVE';
      this.allMockRows.forEach(r => {
        if (request.rowIds.includes(r.id)) {
          r.status = newStatus;
        }
      });
      this.applyClientSideQuery();
    }
    this.logAction(`Bulk action "${request.action}" executed on ${request.rowIds.length} rows`);
  }

  onRowAction(e: { action: string; row: any }): void {
    this.logAction(`Row action "${e.action}" on ${e.row?.customer_name ?? e.row?.id}`);
  }

  onExport(e: { format: 'excel' | 'csv'; rowIds: string[] }): void {
    this.logAction(`Exported ${e.rowIds.length || this.pagination.total} records as ${e.format.toUpperCase()}`);
  }

  onDownload(f: 'excel' | 'csv'): void {
    this.logAction(`Downloading dataset as ${f.toUpperCase()}`);
  }

  onGenerate(): void {
    this.logAction('File generation started');
  }

  onCopyRows(copies: Record<string, any>[]): void {
    copies.forEach(copy => {
      this.allMockRows.unshift({ ...copy, id: `usr_${Date.now()}_${Math.floor(Math.random() * 100)}` });
    });
    this.applyClientSideQuery();
    this.logAction(`Duplicated ${copies.length} rows`);
  }

  onReset(): void {
    this.filterValues = {};
    this.sorts = [];
    this.pagination.page = 1;
    this.initMockDataset();
    this.applyClientSideQuery();
    this.logAction('Table reset — all filters and sorting restored to defaults');
  }

  onDemoMenuItemSelected(item: ActionMenuItem): void {
    this.logAction(`Demo action menu: selected "${item.label}"`);
  }
}
