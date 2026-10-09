import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTable, TableSaveRequest, TableBulkActionRequest } from '../../../components/data-table/table/data-table';
import { Toast, pushToast, ToastMessage } from '../../../components/toast/toast';
import { AddUserModal, AddUserPayload } from '../../../components/modals/add-user-modal';
import { TableApiService } from '../../services/table-api.service';

import type { ColumnDef, PaginationState, SortState, FilterValues, CollabUser } from '../../../components/data-table/models/column-def.model';
import type { TableConfigEntry } from '../../../components/data-table/models/table-config.model';

import {ActionMenuItem, ActionMenuComponent} from '../../../components/data-table/table/action-menu';

@Component({
  selector: 'app-nexora-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DataTable, Toast, AddUserModal, ActionMenuComponent],
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
  private readonly UPDATE_ALL_PATH = '/identity/management/users/update/all';
  private readonly UPDATE_BULK_PATH = '/identity/management/users/update/bulk';
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
  showAddModal   = false;
  actionsOpen      = false;
  actionsDropTop   = 0;
  actionsDropRight = 0;

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

  @ViewChild(DataTable) private table?: DataTable;

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

  onSave(request: TableSaveRequest): void {
    const path = request.mode === 'bulk' ? this.UPDATE_BULK_PATH : this.UPDATE_ALL_PATH;
    const body = request.mode === 'bulk' ? request : request.rows;

    this.api.updateRows(this.BASE_URL, path, body).subscribe({
      next: response => {
        if (response.code === 200) {
          this.table?.completeSave();
          this.toast('success', response.message);
          this.fetchData();
        } else {
          this.toast('error', response.message);
        }
        this.cdr.markForCheck();
      },
    });
  }

  onBulkAction(request: TableBulkActionRequest): void {
    const isBulk = request.mode === 'bulk';
    const status = request.action === 'enable' ? 'active' : 'inactive';
    const path = request.action === 'delete'
      ? `/identity/management/users/delete/${isBulk ? 'bulk' : 'all'}`
      : `/identity/management/users/update/status/${isBulk ? 'bulk' : 'all'}`;
    const body = isBulk
      ? { filters: request.filters, sorts: request.sorts, excluded: request.excluded, ...(request.action === 'delete' ? {} : { status }) }
      : request.action === 'delete'
        ? { ids: request.rowIds }
        : { ids: request.rowIds, status };
    const method = request.action === 'delete' ? 'DELETE' : 'POST';

    this.api.mutateRows(this.BASE_URL, path, method, body).subscribe({
      next: response => {
        if (response.code === 200) {
          this.table?.completeSave();
          this.toast('success', response.message);
          this.fetchData();
        } else {
          this.toast('error', response.message);
        }
        this.cdr.markForCheck();
      },
    });
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

  /**
   * Copy — POSTs the stripped-down row copies to /users/create/bulk.
   * These are brand-new records; existing rows and their edit state are untouched.
   */
  onCopyRows(copies: Record<string, any>[]): void {
    if (!copies.length) return;
    this.api.mutateRows(this.BASE_URL, '/identity/management/users/create/bulk', 'POST', copies).subscribe({
      next: r => {
        if (r.code === 200) {
          this.toast('success', `${copies.length} row${copies.length > 1 ? 's' : ''} duplicated successfully`);
          this.fetchData();
        } else {
          this.toast('error', r.message ?? 'Failed to duplicate rows');
        }
        this.cdr.markForCheck();
      },
    });
  }

  /** Reset — reload fresh data from the API; discards any client-side edits */
  onReset(): void {
    this.fetchData();
    this.toast('info', 'Table reset — data reloaded from server');
  }

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


  demoMenuItems: ActionMenuItem[] = [
    { key: 'edit', label: 'Edit', icon: '✎' },
    { key: 'refresh', label: 'Refresh', icon: '⟳' },
    {
      key: 'export',
      label: 'Export',
      icon: '⇧',
      children: [
        { key: 'excel', label: 'Excel (.xlsx)' },
        { key: 'csv', label: 'CSV (.csv)' },
      ],
    },
    {
      key: 'download',
      label: 'Download',
      icon: '↓',
      children: [
        { key: 'current', label: 'Current page' },
        { key: 'all', label: 'All rows' },
      ],
    },
  ];

  onDemoMenuItemSelected(item: ActionMenuItem): void {
    console.log('Selected demo item:', item.key);
  }
}
