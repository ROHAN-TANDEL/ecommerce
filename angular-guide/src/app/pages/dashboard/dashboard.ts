import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTable } from '../../../components/data-table/table/data-table';
import { TableApiService } from '../../services/table-api.service';

import type { ColumnDef, PaginationState, SortState, FilterValues, CollabUser } from '../../../components/data-table/models/column-def.model';
import type { TableConfigEntry } from '../../../components/data-table/models/table-config.model';

/**
 * Dashboard — single-page view of the Customers data table.
 *
 * Wires the DataTable component to real APIs:
 *   GET /identity/management/customers/config           → column definitions
 *   GET /identity/management/customers/table-config     → table capability flags
 *   GET /identity/management/customers?page=&limit=…   → row data + pagination
 *   PATCH /identity/management/customers/:id            → save row edits
 *
 * Responsibilities of this page component:
 *   • Bootstrap (parallel config + table-config load)
 *   • React to sort/filter/page changes → re-fetch rows
 *   • Handle save, bulk actions, export events from the table
 *   • Provide mock collab users (real presence service would replace this)
 *
 * The DataTable component itself is stateless regarding data —
 * it receives [rows], [columns], [pagination] as inputs and emits events.
 * All data-fetching lives here, keeping the table reusable.
 */
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

  // ── Config ──────────────────────────────────────────────────────────
  private readonly BASE_URL = 'http://localhost:3000/identity/management';
  private readonly DATA_PATH = '/customers';
  private readonly CONFIG_PATH = '/customers/config';
  private readonly TABLE_CONFIG_PATH = '/customers/table-config';
  private readonly UPDATE_PATH = '/customers/:id';

  // ── Table state (passed as @Inputs to <dt-table>) ───────────────────
  columns: ColumnDef[] = [];
  rows: any[] = [];
  tableConfig: TableConfigEntry | null = null;
  pagination: PaginationState = { page: 1, limit: 25, total: 0, totalPages: 1 };
  sorts: SortState[] = [];
  filterValues: FilterValues = {};
  loading = false;
  bootstrapping = true;
  error: string | null = null;

  // ── Mock live-collaboration users ───────────────────────────────────
  readonly collabUsers: CollabUser[] = [
    { id: 'u1', name: 'John Doe',      initials: 'JD', color: 'bg-indigo-100', textColor: 'text-indigo-700', isViewing: true,  isEditing: false },
    { id: 'u2', name: 'Sarah Connor',  initials: 'SC', color: 'bg-violet-100', textColor: 'text-violet-700', isViewing: true,  isEditing: true  },
    { id: 'u3', name: 'Tony Stark',    initials: 'TS', color: 'bg-pink-100',   textColor: 'text-pink-700',   isViewing: true,  isEditing: false },
  ];

  // ── Toast / notifications ───────────────────────────────────────────
  toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }> = [];
  private toastCounter = 0;

  // ════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    this.bootstrap();
  }

  bootstrap(): void {
    this.bootstrapping = true;
    this.error = null;

    this.api.bootstrap(this.BASE_URL, this.CONFIG_PATH, this.TABLE_CONFIG_PATH)
      .subscribe({
        next: ({ columns, tableConfig }) => {
          this.columns = columns;
          this.tableConfig = tableConfig;
          this.pagination = {
            page: 1,
            limit: tableConfig?.pagination?.default_page_size ?? 25,
            total: 0,
            totalPages: 1,
          };
          this.bootstrapping = false;
          this.cdr.markForCheck();
          this.fetchData();
        },
        error: (err) => {
          this.error = 'Failed to load table configuration. Please try again.';
          this.bootstrapping = false;
          this.cdr.markForCheck();
        },
      });
  }

  private fetchData(): void {
    this.loading = true;

    this.api.loadData(
      this.BASE_URL,
      this.DATA_PATH,
      this.pagination.page,
      this.pagination.limit,
      this.sorts,
      this.filterValues,
    ).subscribe({
      next: ({ data, pagination }) => {
        this.rows = data;
        this.pagination = pagination;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.toast('Failed to load data', 'error');
      },
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // TABLE EVENT HANDLERS
  // ════════════════════════════════════════════════════════════════════

  onPageChange(page: number): void {
    this.pagination = { ...this.pagination, page };
    this.fetchData();
  }

  onPageSizeChange(limit: number): void {
    this.pagination = { ...this.pagination, limit, page: 1 };
    this.fetchData();
  }

  onSortChange(sorts: SortState[]): void {
    this.sorts = sorts;
    this.pagination = { ...this.pagination, page: 1 };
    this.fetchData();
  }

  onFilterChange(values: FilterValues): void {
    this.filterValues = values;
    this.pagination = { ...this.pagination, page: 1 };
    this.fetchData();
  }

  onCellChanged(event: { rowId: string; key: string; value: any }): void {
    // Live update in the rows array so the UI stays in sync
    if (event.key === '__revert__') {
      // Revert handled inside EditableRow itself; rows array is already mutated back
      return;
    }
    const row = this.rows.find(r => r[this.tableConfig?.primary_key ?? 'id'] === event.rowId);
    if (row) row[event.key] = event.value;
  }

  onSaveRow(event: { rowId: string; changes: Record<string, any> }): void {
    this.api.saveRow(this.BASE_URL, this.UPDATE_PATH, event.rowId, event.changes)
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.toast('Changes saved', 'success');
          } else {
            this.toast(result.error ?? 'Save failed', 'error');
          }
          this.cdr.markForCheck();
        },
      });
  }

  onBulkAction(event: { action: string; rowIds: string[] }): void {
    // Stub: real implementation would call respective API endpoints
    this.toast(`${event.action} applied to ${event.rowIds.length} rows`, 'info');
  }

  onRowAction(event: { action: string; row: any }): void {
    // Pass-through actions that don't need special handling at page level
    this.toast(`${event.action}: ${event.row[this.tableConfig?.primary_key ?? 'id']}`, 'info');
  }

  onExport(event: { format: 'excel' | 'csv'; rowIds: string[] }): void {
    // Stub: real implementation would call export API
    this.toast(`Exporting ${event.rowIds.length || 'all'} rows as ${event.format.toUpperCase()}…`, 'info');
  }

  onGenerate(): void {
    this.toast('File generation started…', 'info');
  }

  onDownload(format: 'excel' | 'csv'): void {
    this.toast(`Downloading ${format.toUpperCase()} file…`, 'info');
  }

  onColumnsChanged(cols: ColumnDef[]): void {
    this.columns = cols;
  }

  onSelectionChange(ids: string[]): void {
    // Available for parent-level selection awareness if needed
  }

  // ════════════════════════════════════════════════════════════════════
  // TOAST HELPER
  // ════════════════════════════════════════════════════════════════════

  private toast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = ++this.toastCounter;
    this.toasts = [...this.toasts, { id, message, type }];
    this.cdr.markForCheck();
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.cdr.markForCheck();
    }, 3500);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }
}
