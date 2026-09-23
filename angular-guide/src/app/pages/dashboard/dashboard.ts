import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTable } from '../../../components/data-table/table/data-table';
import { TableApiService } from '../../services/table-api.service';

import type {
  ColumnDef, PaginationState, SortState, FilterValues, CollabUser,
} from '../../../components/data-table/models/column-def.model';
import type { TableConfigEntry } from '../../../components/data-table/models/table-config.model';

// ── Minimal helper: build a TableConfigEntry without writing out every field ──
function makeConfig(overrides: Partial<TableConfigEntry> = {}): TableConfigEntry {
  return {
    table_name: 'demo', display_name: 'Demo',
    data_api: '', update_api: '', config_api: '', table_config_api: '',
    primary_key: 'id',
    selection:        { enabled: true,  multiple: true },
    pagination:       { enabled: false, default_page_size: 25, page_size_options: [10,25,50] },
    sorting:          { enabled: true,  multiple: false },
    filtering:        { enabled: true },
    editing:          { enabled: true,  row_editable: true },
    actions:          { edit: true, delete: true, enable: true, disable: true, revert: true, more: true },
    export:           { enabled: true,  formats: ['excel','csv'] },
    download:         { enabled: true,  formats: ['excel','csv'] },
    column_management:{ enabled: true,  reorder: true, show_hide: true },
    column_freeze:    { enabled: false, start: 0, end: 0 },
    row_freeze:       { enabled: false, top: 0,   bottom: 0 },
    column_resize:    { enabled: true },
    view:             { fullscreen: true, density: true, default_density: 'comfortable' },
    live_collaboration: { enabled: false },
    features:         { column_navigation: false, column_count_indicator: true, save_view: true, reset_view: true },
    ...overrides,
  };
}

// ── Minimal helper: build a ColumnDef ─────────────────────────────────────────
function col(
  key: string, label: string,
  opts: Partial<ColumnDef> = {}
): ColumnDef {
  return {
    key, label,
    width: '160px', minWidth: '80px', maxWidth: '400px', defaultWidth: '160px',
    format: 'text', ellipsis: 'text_elipsis',
    visible: true, sortable: true, filterable: false, editable: true,
    resizable: true, frozen: false, required: false, masterEditAllow: true,
    filterType: 'none', filterData: [], order: 0,
    ...opts,
  };
}

const staticPagination = (total: number): PaginationState =>
  ({ page: 1, limit: total, total, totalPages: 1 });

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DataTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private readonly api = inject(TableApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── API endpoints ────────────────────────────────────────────────────
  private readonly BASE_URL        = 'http://localhost:3000/identity/management';
  private readonly DATA_PATH       = '/customers';
  private readonly CONFIG_PATH     = '/customers/config';
  private readonly TABLE_CFG_PATH  = '/customers/table-config';
  private readonly UPDATE_PATH     = '/customers/:id';

  // ════════════════════════════════════════════════════════════════════
  // TABLE 1 — CUSTOMERS  (live API)
  // ════════════════════════════════════════════════════════════════════
  columns: ColumnDef[] = [];
  rows: any[] = [];
  tableConfig: TableConfigEntry | null = null;
  pagination: PaginationState = { page: 1, limit: 25, total: 0, totalPages: 1 };
  sorts: SortState[] = [];
  filterValues: FilterValues = {};
  loading = false;
  bootstrapping = true;
  error: string | null = null;

  readonly collabUsers: CollabUser[] = [
    { id:'u1', name:'John Doe',     initials:'JD', color:'bg-indigo-100', textColor:'text-indigo-700', isViewing:true,  isEditing:false },
    { id:'u2', name:'Sarah Connor', initials:'SC', color:'bg-violet-100', textColor:'text-violet-700', isViewing:true,  isEditing:true  },
    { id:'u3', name:'Tony Stark',   initials:'TS', color:'bg-pink-100',   textColor:'text-pink-700',   isViewing:true,  isEditing:false },
  ];

  // ════════════════════════════════════════════════════════════════════
  // TABLE 2 — ORDERS  (static mock · compact · read-only)
  // ════════════════════════════════════════════════════════════════════
  readonly ordersConfig = makeConfig({
    editing: { enabled: false, row_editable: false },
    filtering: { enabled: false },
    view: { fullscreen: true, density: true, default_density: 'compact' },
    live_collaboration: { enabled: false },
  });

  readonly ordersColumns: ColumnDef[] = [
    col('order_id',    'Order #',   { width:'110px', editable:false, frozen:true, filterType:'search', filterable:true }),
    col('customer',    'Customer',  { width:'180px', editable:false, format:'avatar' }),
    col('status',      'Status',    { width:'120px', editable:false, format:'status' }),
    col('total',       'Total',     { width:'120px', editable:false, format:'number', prefix:'$', decimals:0 }),
    col('items',       'Items',     { width:'80px',  editable:false, format:'number' }),
    col('created_date','Date',      { width:'130px', editable:false, format:'date' }),
    col('region',      'Region',    { width:'130px', editable:false }),
    col('notes',       'Notes',     { width:'200px', editable:false }),
  ];

  readonly ordersRows = [
    { id:'O001', order_id:'#10041', customer:'Acme Corp',        email:'acme@corp.com',  status:'Active',    total:4800,  items:3,  created_date:'2026-09-20', region:'Asia Pacific',  notes:'Priority shipment',  editable:false, selectable:true },
    { id:'O002', order_id:'#10042', customer:'Globex',           email:'info@globex.com',status:'Pending',   total:1250,  items:1,  created_date:'2026-09-21', region:'Europe',        notes:'',                    editable:false, selectable:true },
    { id:'O003', order_id:'#10043', customer:'Umbrella Inc',     email:'',               status:'Disabled',  total:9300,  items:7,  created_date:'2026-09-21', region:'North America', notes:'On hold',             editable:false, selectable:true },
    { id:'O004', order_id:'#10044', customer:'Stark Industries',  email:'',              status:'Active',    total:22000, items:12, created_date:'2026-09-22', region:'North America', notes:'',                    editable:false, selectable:true },
    { id:'O005', order_id:'#10045', customer:'Wayne Corp',       email:'',               status:'Pending',   total:5500,  items:4,  created_date:'2026-09-22', region:'Europe',        notes:'Awaiting approval',   editable:false, selectable:true },
    { id:'O006', order_id:'#10046', customer:'Hooli',            email:'',               status:'Suspended', total:880,   items:2,  created_date:'2026-09-23', region:'North America', notes:'',                    editable:false, selectable:true },
  ];

  // ════════════════════════════════════════════════════════════════════
  // TABLE 3 — INVENTORY  (static mock · spacious · togglable disabled/loading)
  // ════════════════════════════════════════════════════════════════════
  readonly inventoryConfig = makeConfig({
    view: { fullscreen: true, density: true, default_density: 'spacious' },
    live_collaboration: { enabled: false },
  });

  readonly inventoryColumns: ColumnDef[] = [
    col('sku',      'SKU',        { width:'110px', editable:false }),
    col('name',     'Product',    { width:'220px', editable:true,  format:'avatar' }),
    col('category', 'Category',   { width:'140px', editable:false }),
    col('stock',    'In Stock',   { width:'110px', editable:true,  format:'number', decimals:0 }),
    col('price',    'Unit Price', { width:'120px', editable:true,  format:'number', prefix:'$', decimals:2 }),
    col('status',   'Status',     { width:'120px', editable:true,  format:'status' }),
  ];

  readonly inventoryRows = [
    { id:'I001', sku:'SKU-001', name:'Laptop Pro 15',       email:'',  category:'Electronics', stock:142,  price:1299, status:'Active',   editable:true,  selectable:true },
    { id:'I002', sku:'SKU-002', name:'Wireless Mouse',      email:'',  category:'Peripherals', stock:890,  price:49,   status:'Active',   editable:true,  selectable:true },
    { id:'I003', sku:'SKU-003', name:'Mechanical Keyboard', email:'',  category:'Peripherals', stock:0,    price:149,  status:'Disabled', editable:false, selectable:true },
    { id:'I004', sku:'SKU-004', name:'4K Monitor 27"',      email:'',  category:'Displays',    stock:34,   price:699,  status:'Pending',  editable:true,  selectable:true },
    { id:'I005', sku:'SKU-005', name:'USB-C Hub',           email:'',  category:'Accessories', stock:512,  price:79,   status:'Active',   editable:true,  selectable:true },
  ];

  inventoryTableDisabled = false;
  inventoryLoading = false;

  toggleInventoryDisabled(): void {
    this.inventoryTableDisabled = !this.inventoryTableDisabled;
    this.cdr.markForCheck();
  }

  toggleInventoryLoading(): void {
    this.inventoryLoading = true;
    this.cdr.markForCheck();
    setTimeout(() => { this.inventoryLoading = false; this.cdr.markForCheck(); }, 2500);
  }

  // ════════════════════════════════════════════════════════════════════
  // TABLE 4 — TEAM MEMBERS  (static mock · comfortable · all row states)
  // ════════════════════════════════════════════════════════════════════
  readonly teamConfig = makeConfig({
    live_collaboration: { enabled: false },
  });

  readonly teamColumns: ColumnDef[] = [
    col('name',       'Name',       { width:'200px', editable:true,  format:'avatar', secondaryKey:'role' }),
    col('email',      'Email',      { width:'210px', editable:true }),
    col('department', 'Department', { width:'160px', editable:false }),
    col('status',     'Status',     { width:'120px', editable:true,  format:'status' }),
    col('join_date',  'Joined',     { width:'120px', editable:false, format:'date' }),
  ];

  readonly teamRows = [
    { id:'T001', name:'Alice Johnson', role:'Engineering Lead', email:'alice@co.com', department:'Engineering', status:'Active',   join_date:'2024-01-01', editable:true,  selectable:true  },
    { id:'T002', name:'Bob Martinez',  role:'Senior Designer',  email:'bob@co.com',   department:'Design',       status:'Active',   join_date:'2024-03-15', editable:true,  selectable:true  },
    { id:'T003', name:'Carol White',   role:'PM',               email:'carol@co.com', department:'Product',      status:'Pending',  join_date:'2024-06-20', editable:false, selectable:true  },
    { id:'T004', name:'Dave Brown',    role:'SRE',              email:'dave@co.com',  department:'Engineering', status:'Disabled', join_date:'2023-02-05', editable:false, selectable:false, disabled:true },
    { id:'T005', name:'Eve Chen',      role:'QA Engineer',      email:'not-valid',    department:'QA',           status:'Active',   join_date:'2024-08-10', editable:true,  selectable:true,  rowState:'error',   errorCells:['email'],      errorMessage:'Invalid email' },
    { id:'T006', name:'Frank Diaz',    role:'Data Analyst',     email:'frank@co.com', department:'Analytics',    status:'Pending',  join_date:'2024-09-22', editable:true,  selectable:true,  rowState:'warning', warningCells:['department'], warningMessage:'Dept unconfirmed' },
  ];

  // ════════════════════════════════════════════════════════════════════
  // TOAST
  // ════════════════════════════════════════════════════════════════════
  toasts: Array<{ id: number; message: string; type: 'success'|'error'|'info' }> = [];
  private toastCounter = 0;

  // ════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════════════
  ngOnInit(): void { this.bootstrap(); }

  bootstrap(): void {
    this.bootstrapping = true;
    this.error = null;
    this.api.bootstrap(this.BASE_URL, this.CONFIG_PATH, this.TABLE_CFG_PATH).subscribe({
      next: ({ columns, tableConfig }) => {
        this.columns    = columns;
        this.tableConfig = tableConfig;
        this.pagination  = { page:1, limit: tableConfig?.pagination?.default_page_size ?? 25, total:0, totalPages:1 };
        this.bootstrapping = false;
        this.cdr.markForCheck();
        this.fetchData();
      },
      error: () => {
        this.error = 'Failed to load table configuration. Please try again.';
        this.bootstrapping = false;
        this.cdr.markForCheck();
      },
    });
  }

  private fetchData(): void {
    this.loading = true;
    this.api.loadData(this.BASE_URL, this.DATA_PATH, this.pagination.page, this.pagination.limit, this.sorts, this.filterValues).subscribe({
      next: ({ data, pagination }) => {
        // Inject synthetic rows to demonstrate all row states alongside live data
        const synthetic = [
          {
            id: '__demo_disabled__', customer_name: 'Locked Account (demo)',
            email: 'locked@demo.com', status: 'Disabled', industry: 'Demo',
            country: 'USA', country_code: 'US', annual_revenue: 0,
            employee_count: 0, onboarding_date: null, risk_level: 'Low',
            owner_name: 'System', is_active: false, editable: false,
            disabled: true, selectable: false,
            _demo: true,
          },
          {
            id: '__demo_warning__', customer_name: 'Revenue Unverified (demo)',
            email: 'warn@demo.com', status: 'Pending', industry: 'Demo',
            country: 'Germany', country_code: 'DE', annual_revenue: 999999,
            employee_count: 50, onboarding_date: null, risk_level: 'Medium',
            owner_name: 'Alice', is_active: true, editable: true,
            rowState: 'warning', warningCells: ['annual_revenue'], warningMessage: 'Revenue unverified',
            selectable: true, _demo: true,
          },
          {
            id: '__demo_error__', customer_name: 'Invalid Email (demo)',
            email: 'not-valid-email', status: 'Active', industry: 'Demo',
            country: 'India', country_code: 'IN', annual_revenue: 500000,
            employee_count: 10, onboarding_date: null, risk_level: 'Low',
            owner_name: 'Bob', is_active: true, editable: true,
            rowState: 'error', errorCells: ['email'], errorMessage: 'Invalid email address',
            selectable: true, _demo: true,
          },
        ];
        this.rows       = [...data, ...synthetic];
        this.pagination  = pagination;
        this.loading     = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); this.toast('Failed to load data','error'); },
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ════════════════════════════════════════════════════════════════════
  onPageChange(p: number):          void { this.pagination = { ...this.pagination, page:p }; this.fetchData(); }
  onPageSizeChange(l: number):      void { this.pagination = { ...this.pagination, limit:l, page:1 }; this.fetchData(); }
  onSortChange(s: SortState[]):     void { this.sorts = s; this.pagination = { ...this.pagination, page:1 }; this.fetchData(); }
  onFilterChange(v: FilterValues):  void { this.filterValues = v; this.pagination = { ...this.pagination, page:1 }; this.fetchData(); }
  onColumnsChanged(c: ColumnDef[]): void { this.columns = c; }
  onSelectionChange(_: string[]):   void {}

  onCellChanged(e: { rowId:string; key:string; value:any }): void {
    if (e.key === '__revert__') return;
    const row = this.rows.find(r => r[this.tableConfig?.primary_key ?? 'id'] === e.rowId);
    if (row) row[e.key] = e.value;
  }

  onSaveRow(e: { rowId:string; changes:Record<string,any> }): void {
    this.api.saveRow(this.BASE_URL, this.UPDATE_PATH, e.rowId, e.changes).subscribe({
      next: r => { this.toast(r.success ? 'Changes saved' : (r.error ?? 'Save failed'), r.success ? 'success' : 'error'); this.cdr.markForCheck(); },
    });
  }

  onBulkAction(e: { action:string; rowIds:string[] }): void {
    this.toast(`${e.action} applied to ${e.rowIds.length} rows`, 'info');
  }

  onRowAction(e: { action:string; row:any }): void {
    this.toast(`${e.action}: ${e.row?.id ?? ''}`, 'info');
  }

  onExport(e: { format:'excel'|'csv'; rowIds:string[] }): void {
    this.toast(`Exporting as ${e.format.toUpperCase()}…`, 'info');
  }

  onGenerate(): void { this.toast('File generation started…','info'); }

  onDownload(f: 'excel'|'csv'): void { this.toast(`Downloading ${f.toUpperCase()}…`,'info'); }

  // ════════════════════════════════════════════════════════════════════
  // TOAST HELPER
  // ════════════════════════════════════════════════════════════════════
  private toast(message: string, type: 'success'|'error'|'info' = 'info'): void {
    const id = ++this.toastCounter;
    this.toasts = [...this.toasts, { id, message, type }];
    this.cdr.markForCheck();
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }, 3500);
  }

  dismissToast(id: number): void { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }
}
