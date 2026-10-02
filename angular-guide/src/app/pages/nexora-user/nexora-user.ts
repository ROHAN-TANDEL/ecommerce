import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTable }     from '../../../components/data-table/table/data-table';
import { Toast, pushToast, ToastMessage } from '../../../components/toast/toast';
import { AddUserModal, AddUserPayload } from '../../../components/modals/add-user-modal';
import { TableApiService } from '../../services/table-api.service';

import type { ColumnDef, PaginationState, SortState, FilterValues, CollabUser } from '../../../components/data-table/models/column-def.model';
import type { TableConfigEntry } from '../../../components/data-table/models/table-config.model';

@Component({
  selector: 'app-nexora-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DataTable, Toast, AddUserModal],
  templateUrl: './nexora-user.html',
  styleUrl: './nexora-user.css',
})
export class NexoraUser implements OnInit {

  private readonly api = inject(TableApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── API endpoints (seeded from table-config, then overridden by config response) ──
  private readonly BASE_URL     = 'http://localhost:3000';
  private CONFIG_PATH           = '/identity/management/users/config/columns';
  private TABLE_CFG_PATH        = '/identity/management/users/config/table';
  private DATA_PATH             = '/identity/management/users';
  private UPDATE_PATH           = '/identity/management/users/update/:id';
  private CREATE_PATH           = '/identity/management/users/create';

  // ── Table 1 state ──────────────────────────────────────────────────
  columns: ColumnDef[]          = [];
  rows: any[]                   = [];
  tableConfig: TableConfigEntry | null = null;
  pagination: PaginationState   = { page: 1, limit: 25, total: 0, totalPages: 1 };
  sorts: SortState[]            = [];
  filterValues: FilterValues    = {};
  loading                       = false;
  bootstrapping                 = true;
  error: string | null          = null;

  // ── Modal ──────────────────────────────────────────────────────────
  showAddModal = false;

  // ── Toast ──────────────────────────────────────────────────────────
  toasts: ToastMessage[] = [];

  // ── Collab (mock — replace with real socket service) ──────────────
  readonly collabUsers: CollabUser[] = [
    { id:'u1', name:'John Doe',     initials:'JD', color:'bg-indigo-100', textColor:'text-indigo-700', isViewing:true,  isEditing:false },
    { id:'u2', name:'Sarah Connor', initials:'SC', color:'bg-violet-100', textColor:'text-violet-700', isViewing:true,  isEditing:true  },
  ];

  // ════════════════════════════════════════════════════════════════════
  ngOnInit(): void { this.bootstrap(); }

  bootstrap(): void {
    this.bootstrapping = true;
    this.error = null;

    this.api.bootstrap(this.BASE_URL, this.CONFIG_PATH, this.TABLE_CFG_PATH).subscribe({
      next: ({ columns, tableConfig }) => {
        this.columns     = columns;
        this.tableConfig = tableConfig;

        // data_api from config is a full path like /identity/management/users
        // BASE_URL is now just the host — use as-is
        if (tableConfig?.data_api)   this.DATA_PATH   = tableConfig.data_api;
        if (tableConfig?.update_api) this.UPDATE_PATH = tableConfig.update_api;

        this.pagination = {
          page: 1,
          limit: tableConfig?.pagination?.default_page_size ?? 25,
          total: 0, totalPages: 1,
        };
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
    this.api.loadData(
      this.BASE_URL, this.DATA_PATH,
      this.pagination.page, this.pagination.limit,
      this.sorts, this.filterValues,
      'user',          // ← user API returns { user: [...] }
    ).subscribe({
      next: ({ data, pagination }) => {
        this.rows       = data;
        this.pagination = pagination;
        this.loading    = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.toast('error', 'Failed to load users');
      },
    });
  }

  // ── Table event handlers ───────────────────────────────────────────

  onPageChange(page: number):         void { this.pagination = { ...this.pagination, page }; this.fetchData(); }
  onPageSizeChange(limit: number):    void { this.pagination = { ...this.pagination, limit, page: 1 }; this.fetchData(); }
  onSortChange(s: SortState[]):       void { this.sorts = s; this.pagination = { ...this.pagination, page: 1 }; this.fetchData(); }
  onFilterChange(v: FilterValues):    void { this.filterValues = v; this.pagination = { ...this.pagination, page: 1 }; this.fetchData(); }
  onColumnsChanged(c: ColumnDef[]):   void { this.columns = c; }
  onSelectionChange(_: string[]):     void {}

  onCellChanged(e: { rowId: string; key: string; value: any }): void {
    if (e.key === '__revert__') return;
    const row = this.rows.find(r => r[this.tableConfig?.primary_key ?? 'id'] === e.rowId);
    if (row) row[e.key] = e.value;
  }

  onSaveRow(e: { rowId: string; changes: Record<string, any> }): void {
    this.api.saveRow(this.BASE_URL, this.UPDATE_PATH, e.rowId, e.changes, 'PUT').subscribe({
      next: r => {
        this.toast(r.success ? 'success' : 'error', r.success ? 'User updated' : (r.error ?? 'Update failed'));
        this.cdr.markForCheck();
      },
    });
  }

  onBulkAction(e: { action: string; rowIds: string[] }): void {
    this.toast('info', `${e.action} applied to ${e.rowIds.length} user${e.rowIds.length !== 1 ? 's' : ''}`);
  }

  onRowAction(e: { action: string; row: any }): void {
    if (e.action === 'delete') {
      this.toast('warning', `Delete not yet wired for user ${e.row?.id}`);
      return;
    }
    this.toast('info', `${e.action}: ${e.row?.first_name ?? e.row?.id}`);
  }

  onExport(e: { format: 'excel' | 'csv'; rowIds: string[] }): void {
    this.toast('info', `Exporting as ${e.format.toUpperCase()}…`);
  }

  onGenerate(): void { this.toast('info', 'File generation started…'); }

  onDownload(f: 'excel' | 'csv'): void { this.toast('info', `Downloading ${f.toUpperCase()}…`); }

  // ── Add User modal ─────────────────────────────────────────────────

  onAddUser(payload: AddUserPayload): void {
    this.api.createRow(this.BASE_URL, this.CREATE_PATH, payload).subscribe({
      next: r => {
        if (r.success) {
          this.toast('success', `User ${payload.first_name} ${payload.last_name} created`);
          this.showAddModal = false;
          this.fetchData(); // refresh table
        } else {
          this.toast('error', r.error ?? 'Failed to create user');
        }
        this.cdr.markForCheck();
      },
    });
  }

  // ── Toast helper ───────────────────────────────────────────────────

  removeToast = (id: number): void => {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  };

  private toast(type: ToastMessage['type'], message: string): void {
    this.toasts = pushToast(this.toasts, type, message, this.removeToast);
    this.cdr.markForCheck();
  }
}
