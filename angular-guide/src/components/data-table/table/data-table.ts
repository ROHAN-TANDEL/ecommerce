import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges,
  SimpleChanges, HostListener, ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── TABLE level ──────────────────────────────────────────────────────
import { LazyScroll }      from './lazy-scroll';
import { ToolbarActions }  from './toolbar-actions';
import { FilterRow }       from './filter-row';
import { CollabBar }       from './collab-bar';
import { TablePagination } from './pagination';

// ── COLUMN level ─────────────────────────────────────────────────────
import { ColumnHeader }    from '../column/header';
import { SelectionColumn } from '../column/selection';
import { ActionColumn }    from '../column/action';

// ── ROW level ────────────────────────────────────────────────────────
import { EditableRow }    from '../row/editable';
import { ReadonlyRow }    from '../row/readonly';
import { DisabledRow }    from '../row/disabled';
import { UnavailableRow } from '../row/unavailable';

// ── CELL level (resolved inside row sub-component templates) ─────────
import { PlainTextCell }             from '../cell/plain-text';
import { ImageAndPlainText }         from '../cell/image-text';
import { FlagAndPlainText }          from '../cell/flag-text';
import { NumberSeparationWithComma } from '../cell/number';
import { StatusBadgeCell }           from '../cell/status-badge';

// ── Models ────────────────────────────────────────────────────────────
import type { ColumnDef, PaginationState, SortState, FilterValues, CollabUser } from '../models/column-def.model';
import type { TableConfigEntry, ActionsConfig, ExportConfig, DownloadConfig } from '../models/table-config.model';
import type { ActionBarState, ActionKey, GenerateInfo } from './toolbar-actions';

export type { ActionBarState };

/**
 * DataTable — Master table orchestrator.
 *
 * ─── HIERARCHY ────────────────────────────────────────────────────────
 *
 *   TABLE  (global capability + visual modes)
 *     └── COLUMN  (vertical contract: ColumnDef[])
 *           └── ROW  (horizontal state — resolved per row)
 *                 └── CELL  (presentation — resolved per cell inside each row)
 *
 * ─── ROW RESOLUTION PRIORITY (strongest first) ───────────────────────
 *   row.disabled = true                             → DisabledRow
 *   row.rowState = 'error' | 'warning'              → UnavailableRow
 *   selectedIds.includes(pk) AND tableConfig.editing.row_editable
 *                                                   → EditableRow  (col.editable gates each cell)
 *   default                                         → ReadonlyRow
 *
 * ─── CHECKBOX / SELECTION RULES ──────────────────────────────────────
 *   Master checkbox:
 *     unchecked → all unchecked
 *     indeterminate → some checked
 *     checked → all selectable rows selected AND those with editable=true enter edit mode
 *   Individual checkbox checked → that row enters edit mode (if editable)
 *   Individual checkbox unchecked → discards unsaved changes
 *   Master checked + individual unchecked → indeterminate on that row checkbox
 *   Readonly rows: checkbox selectable but never enters edit mode
 *
 * ─── MASTER EDIT FIELD ────────────────────────────────────────────────
 *   When 1+ rows selected, a master-edit input row is shown below the filter row.
 *   Values typed there propagate to all selected editable rows for cols where
 *   masterEditAllow = true.
 *
 * ─── COLUMN NAVIGATION ───────────────────────────────────────────────
 *   Columns are paged in sets of colPageSize.
 *   Left arrow disabled when on page 0; right arrow disabled at last page.
 */
@Component({
  selector: 'dt-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    // Table
    LazyScroll, ToolbarActions, FilterRow, CollabBar, TablePagination,
    // Column
    ColumnHeader, SelectionColumn, ActionColumn,
    // Row
    EditableRow, ReadonlyRow, DisabledRow, UnavailableRow,
    // Cell
    PlainTextCell, ImageAndPlainText, FlagAndPlainText,
    NumberSeparationWithComma, StatusBadgeCell,
  ],
  template: `
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- FULLSCREEN WRAPPER                                             -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div
    class="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm
           transition-all duration-200 overflow-hidden"
    [class.fixed]="fullscreen"
    [class.inset-0]="fullscreen"
    [class.z-[60]]="fullscreen"
    [class.rounded-none]="fullscreen"
    [class.border-0]="fullscreen"
    [class.shadow-2xl]="fullscreen"
    [class.opacity-60]="tableDisabled"
    [class.pointer-events-none]="tableDisabled"
    [attr.aria-label]="title + ' data table'"
  >

    <!-- ── PAGE HEADER ──────────────────────────────────────────── -->
    <div class="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-base font-semibold text-[#0A173D]">{{ title }}</h2>
          <span *ngIf="pagination.total > 0"
            class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#436CF3]">
            {{ pagination.total | number }}
          </span>
        </div>
        <p *ngIf="subtitle" class="mt-0.5 text-xs text-slate-400">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-1 text-xs text-slate-400">
        <span>Home</span>
        <span class="mx-1">›</span>
        <span class="text-slate-600">{{ title }}</span>
      </div>
    </div>

    <!-- ── STATUS BANNERS ───────────────────────────────────────── -->
    <div *ngIf="tableDisabled"
      class="flex items-center justify-center border-b border-red-200 bg-red-50
             px-4 py-1.5 text-xs font-medium text-red-500"
      aria-live="polite">
      ⊘ This table is currently disabled
    </div>
    <div *ngIf="tableReadonly && !tableDisabled"
      class="flex items-center justify-center border-b border-amber-200 bg-amber-50
             px-4 py-1.5 text-xs font-medium text-amber-600"
      aria-live="polite">
      🔒 Read-only mode — editing is not available
    </div>

    <!-- ── TOOLBAR ACTIONS ──────────────────────────────────────── -->
    <div class="border-b border-slate-200 px-3 py-2">
      <dt-toolbar-actions
        [actions]="tableConfig?.actions ?? defaultActions"
        [exportConfig]="tableConfig?.export ?? defaultExport"
        [downloadConfig]="tableConfig?.download ?? defaultDownload"
        [columnMgmt]="tableConfig?.column_management ?? defaultColMgmt"
        [features]="tableConfig?.features ?? defaultFeatures"
        [selectionCount]="selectedIds.length"
        [actionState]="computedActionState"
        [columns]="columns"
        [fullscreen]="fullscreen"
        [minimized]="minimized"
        [density]="density"
        [activeView]="activeView"
        [savedViews]="savedViews"
        [generateInfo]="generateInfo"
        [colPage]="colPage"
        [colPageSize]="colPageSize"
        [colTotalPages]="colTotalPages"
        [colRangeLabel]="colRangeLabel"
        (actionClicked)="onToolbarAction($event)"
        (exportClicked)="onExport($event)"
        (generateClicked)="onGenerate()"
        (downloadClicked)="onDownload($event)"
        (fullscreenChange)="fullscreen = $event"
        (minimizedChange)="minimized = $event"
        (densityChange)="density = $event"
        (viewChange)="activeView = $event"
        (saveViewClicked)="saveCurrentView()"
        (resetViewClicked)="resetView()"
        (colPageChange)="colPage = $event"
        (applyColumnsClicked)="applyColumnVisibility($event)"
        (resetColumnsClicked)="resetColumnVisibility()"
      />
    </div>

    <!-- ── LIVE COLLABORATION BAR ────────────────────────────────── -->
    <dt-collab-bar
      *ngIf="tableConfig?.live_collaboration?.enabled && collabUsers.length > 0"
      [users]="collabUsers"
    />

    <!-- ── COLLAPSED SUMMARY ─────────────────────────────────────── -->
    <div *ngIf="minimized"
      class="px-5 py-3 text-xs text-slate-400 italic cursor-pointer hover:text-slate-600"
      (click)="minimized = false"
      title="Click to expand">
      Table collapsed — {{ pagination.total | number }} rows · click to expand
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- SCROLLABLE TABLE AREA                                       -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div *ngIf="!minimized"
      class="overflow-x-auto"
      [class.flex-1]="fullscreen"
      [class.overflow-y-auto]="fullscreen"
      dtLazyScroll
      [threshold]="200"
      [loading]="loading"
      (loadMore)="onLoadMore()">

      <table class="w-full table-fixed" [style.minWidth]="tableMinWidth" role="grid">

        <!-- ── THEAD ──────────────────────────────────────────────── -->
        <thead class="sticky top-0 z-20">

          <!-- Row 1: Column headers -->
          <tr class="border-b border-slate-200 bg-slate-50">

            <dt-col-selection
              class="contents"
              [visible]="showCheckboxes"
              [selectedCount]="selectedIds.length"
              [totalCount]="selectableRowCount"
              (masterChange)="onMasterSelect($event)"
            />

            <dt-column-header
              *ngFor="let col of pagedColumns"
              class="contents"
              [label]="col.label"
              [width]="col.width"
              [minWidth]="col.minWidth"
              [maxWidth]="col.maxWidth"
              [infoNote]="col.infoNote ?? ''"
              [sortable]="col.sortable && !tableDisabled && (tableConfig?.sorting?.enabled ?? true)"
              [filterable]="col.filterable"
              [filterActive]="isFilterActive(col.key)"
              [editable]="tableReadonly ? false : (col.editable ?? null)"
              [resizable]="col.resizable && (tableConfig?.column_resize?.enabled ?? true)"
              [frozen]="col.frozen"
              [required]="col.required"
              [sortDirection]="getSortDirection(col.key)"
              (sortChange)="onSort(col.key, $event)"
              (widthChange)="onColWidthChange(col.key, $event)"
            />

            <!-- Actions header -->
            <th *ngIf="showActions"
              class="w-[120px] bg-slate-50 px-3 py-2.5 align-middle text-left text-[11px]
                       font-semibold text-[#0A173D]">Actions</th>

          </tr>

          <!-- Row 2: Filter row -->
          <tr dt-filter-row
            *ngIf="tableConfig?.filtering?.enabled !== false"
            [columns]="pagedColumns"
            [values]="filterValues"
            (filterChange)="onFilterChange($event)"
            (filterClear)="onFilterClear()"
            class="border-b border-slate-200 bg-white">
          </tr>

          <!-- Row 3: Master-edit input row (shown when rows selected) -->
          <tr *ngIf="selectedIds.length > 0 && tableConfig?.editing?.enabled && !tableReadonly && !tableDisabled"
            class="border-b border-[#436CF3]/20 bg-blue-50/40">

            <!-- Selection cell — master edit label -->
            <td class="w-[54px] px-3 py-2 align-middle">
              <span class="text-[9px] font-semibold text-[#436CF3] uppercase tracking-wide">All</span>
            </td>

            <!-- Per-column master-edit inputs -->
            <td *ngFor="let col of pagedColumns"
              class="px-3 py-1.5 align-middle"
              [style.width]="col.width">
              <ng-container *ngIf="col.editable && col.masterEditAllow; else masterRoCell">
                <input type="text"
                  class="h-7 w-full rounded-md border border-[#436CF3]/50 bg-white px-2.5
                         text-[11px] outline-none placeholder:text-slate-300
                         focus:border-[#436CF3] focus:ring-1 focus:ring-blue-200/70"
                  [placeholder]="'All ' + col.label"
                  [(ngModel)]="masterEditValues[col.key]"
                  (ngModelChange)="onMasterEditChange(col.key, $event)" />
              </ng-container>
              <ng-template #masterRoCell><div class="h-7"></div></ng-template>
            </td>

            <!-- Actions cell -->
            <td class="w-[120px] px-3 py-1.5 align-middle">
              <button type="button"
                class="h-7 rounded-md border border-slate-200 bg-white px-2.5
                       text-[10px] font-medium text-slate-500 hover:bg-slate-50"
                (click)="clearMasterEdit()">Clear</button>
            </td>

          </tr>

        </thead>

        <!-- ── TBODY ──────────────────────────────────────────────── -->
        <tbody>

          <!-- Loading skeleton -->
          <ng-container *ngIf="loading">
            <tr *ngFor="let s of skeletonRows" class="border-b border-slate-100 animate-pulse">
              <td class="w-[54px] px-3 py-2.5">
                <div class="h-4 w-4 rounded bg-slate-200"></div>
              </td>
              <td *ngFor="let col of pagedColumns" [style.width]="col.width" class="px-3 py-2.5">
                <div class="h-3 rounded bg-slate-200"
                  [style.width]="col.format === 'avatar' ? '75%' : '60%'"></div>
                <div *ngIf="col.format === 'avatar'" class="mt-1.5 h-2 w-2/5 rounded bg-slate-100"></div>
              </td>
              <td class="w-[120px] px-3 py-2.5">
                <div class="h-3 w-12 rounded bg-slate-200 ml-auto"></div>
              </td>
            </tr>
          </ng-container>

          <!-- Empty state -->
          <ng-container *ngIf="!loading && rows.length === 0">
            <tr>
              <td [attr.colspan]="pagedColumns.length + 2" class="py-20 text-center">
                <div class="flex flex-col items-center gap-3">
                  <span class="text-5xl opacity-20">◫</span>
                  <p class="text-sm font-medium text-slate-400">No results found</p>
                  <p class="text-xs text-slate-300">
                    {{ hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Add records to get started.' }}
                  </p>
                  <button *ngIf="hasActiveFilters" type="button"
                    class="mt-1 rounded-md border border-slate-200 bg-white px-4 py-1.5
                           text-xs font-medium text-slate-500 hover:bg-slate-50"
                    (click)="onFilterClear()">Clear filters</button>
                </div>
              </td>
            </tr>
          </ng-container>

          <!-- ── ROW HIERARCHY RESOLUTION ──────────────────────── -->
          <ng-container *ngIf="!loading && rows.length > 0">
            <ng-container *ngFor="let row of rows; let even = even">

              <!-- PRIMARY KEY accessor -->
              <ng-container [ngSwitch]="resolveRowState(row)">

                <!-- 1. DISABLED -->
                <dt-row-disabled *ngSwitchCase="'disabled'"
                  class="contents"
                  [row]="row"
                  [columns]="pagedColumns">
                  <ng-container rowActions>
                    <dt-col-action
                      [row]="row"
                      [actions]="buildRowActions(row)"
                      (actionFired)="onRowAction($event)" />
                  </ng-container>
                </dt-row-disabled>

                <!-- 2. ERROR / WARNING -->
                <dt-row-unavailable *ngSwitchCase="'unavailable'"
                  class="contents"
                  [row]="row"
                  [columns]="pagedColumns"
                  [rowState]="row.rowState"
                  [errorCells]="row.errorCells ?? []"
                  [warningCells]="row.warningCells ?? []"
                  [selected]="isSelected(pk(row))"
                  (selectedChange)="toggleSelection(pk(row), $event)">
                  <ng-container rowActions>
                    <dt-col-action
                      [row]="row"
                      [actions]="buildRowActions(row)"
                      (actionFired)="onRowAction($event)" />
                  </ng-container>
                </dt-row-unavailable>

                <!-- 3. EDITING -->
                <dt-row-editable *ngSwitchCase="'editing'"
                  class="contents"
                  [row]="row"
                  [columns]="pagedColumns"
                  [selected]="isSelected(pk(row))"
                  [masterSelected]="masterAllSelected"
                  [masterEditValues]="masterEditValues"
                  [density]="density"
                  (selectedChange)="toggleSelection(pk(row), $event)"
                  (cellChange)="onCellChange(pk(row), $event)">
                  <ng-container rowActions>
                    <dt-col-action
                      [row]="row"
                      [actions]="buildRowActions(row)"
                      (actionFired)="onRowAction($event)" />
                  </ng-container>
                </dt-row-editable>

                <!-- 4. READONLY (default) -->
                <dt-row-readonly *ngSwitchDefault
                  class="contents"
                  [row]="row"
                  [columns]="pagedColumns"
                  [selected]="isSelected(pk(row))"
                  [zebra]="zebra && even"
                  (selectedChange)="toggleSelection(pk(row), $event)">
                  <ng-container rowActions>
                    <dt-col-action
                      [row]="row"
                      [actions]="buildRowActions(row)"
                      (actionFired)="onRowAction($event)" />
                  </ng-container>
                </dt-row-readonly>

              </ng-container>

            </ng-container>
          </ng-container>

        </tbody>
      </table>
    </div>

    <!-- ── PAGINATION FOOTER ─────────────────────────────────────── -->
    <dt-pagination
      *ngIf="!minimized && tableConfig?.pagination?.enabled !== false"
      [state]="pagination"
      [pageSizeOptions]="tableConfig?.pagination?.page_size_options ?? [10,25,50,100]"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
    />

  </div>
  `,
})
export class DataTable implements OnInit, OnChanges {

  // ── Core inputs ───────────────────────────────────────────────────
  /** Display name shown in the page header */
  @Input() title: string = 'Table';
  /** Optional subtitle shown below the title */
  @Input() subtitle: string = '';
  /** Typed column definitions (produced by TableApiService.buildColumnDefs) */
  @Input() columns: ColumnDef[] = [];
  /** Current page of row data */
  @Input() rows: any[] = [];
  /** Primary key field name — defaults to 'id' */
  @Input() primaryKey: string = 'id';
  /** Full table-config entry from the API */
  @Input() tableConfig: TableConfigEntry | null = null;

  // ── Table-level state flags ────────────────────────────────────────
  @Input() loading: boolean = false;
  @Input() tableDisabled: boolean = false;
  @Input() tableReadonly: boolean = false;
  @Input() zebra: boolean = true;
  @Input() stickyHeader: boolean = true;
  @Input() selectable: boolean = true;
  @Input() tableMinWidth: string = '900px';

  // ── Pagination ────────────────────────────────────────────────────
  @Input() pagination: PaginationState = { page: 1, limit: 25, total: 0, totalPages: 1 };

  // ── Sorting ───────────────────────────────────────────────────────
  @Input() sorts: SortState[] = [];

  // ── Filters ───────────────────────────────────────────────────────
  @Input() filterValues: FilterValues = {};

  // ── Collaboration ─────────────────────────────────────────────────
  @Input() collabUsers: CollabUser[] = [];

  // ── Outputs ───────────────────────────────────────────────────────
  @Output() pageChange     = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sortChange     = new EventEmitter<SortState[]>();
  @Output() filterChange   = new EventEmitter<FilterValues>();
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() rowActionFired  = new EventEmitter<{ action: string; row: any }>();
  @Output() cellChanged     = new EventEmitter<{ rowId: string; key: string; value: any }>();
  @Output() saveRowRequested = new EventEmitter<{ rowId: string; changes: Record<string, any> }>();
  @Output() bulkActionFired  = new EventEmitter<{ action: string; rowIds: string[] }>();
  @Output() exportRequested  = new EventEmitter<{ format: 'excel' | 'csv'; rowIds: string[] }>();
  @Output() generateRequested = new EventEmitter<void>();
  @Output() downloadRequested = new EventEmitter<'excel' | 'csv'>();
  @Output() columnsChanged   = new EventEmitter<ColumnDef[]>();

  // ── Internal UI state ─────────────────────────────────────────────
  fullscreen = false;
  minimized = false;
  density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';

  selectedIds: string[] = [];
  editingRows: string[] = [];
  pendingChanges: Record<string, Record<string, any>> = {};

  masterAllSelected = false;
  masterEditValues: Record<string, any> = {};

  activeView = '';
  savedViews: string[] = [];
  generateInfo: GenerateInfo = { generated: false };

  colPage = 0;
  readonly colPageSize = 8;

  readonly skeletonRows = Array(5);

  // ── Defaults (when no tableConfig) ────────────────────────────────
  readonly defaultActions: ActionsConfig = {
    edit: true, delete: true, enable: true, disable: true, revert: true, more: true,
  };
  readonly defaultExport: ExportConfig = { enabled: true, formats: ['excel', 'csv'] };
  readonly defaultDownload: DownloadConfig = { enabled: true, formats: ['excel', 'csv'] };
  readonly defaultColMgmt = { enabled: true, reorder: true, show_hide: true };
  readonly defaultFeatures = {
    column_navigation: true, column_count_indicator: true, save_view: true, reset_view: true,
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.density = this.tableConfig?.view?.default_density ?? 'comfortable';
    this.loadSavedViews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableConfig'] && this.tableConfig) {
      this.density = this.tableConfig.view?.default_density ?? 'comfortable';
    }
    if (changes['columns'] && this.columns.length) {
      this.colPage = 0;
    }
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED GETTERS
  // ═══════════════════════════════════════════════════════════════════

  get showCheckboxes(): boolean {
    return (this.tableConfig as any)?.show_checkboxes !== false &&
           (this.tableConfig?.selection?.enabled !== false) &&
           this.selectable;
  }

  get showActions(): boolean {
    return (this.tableConfig as any)?.show_actions !== false;
  }

  get visibleColumns(): ColumnDef[] {
    return this.columns.filter(c => c.visible !== false);
  }

  get pagedColumns(): ColumnDef[] {
    if (!(this.tableConfig?.features?.column_navigation)) return this.visibleColumns;
    const start = this.colPage * this.colPageSize;
    return this.visibleColumns.slice(start, start + this.colPageSize);
  }


  get colTotalPages(): number {
    return Math.max(1, Math.ceil(this.visibleColumns.length / this.colPageSize));
  }

  get colRangeLabel(): string {
    const start = this.colPage * this.colPageSize + 1;
    const end = Math.min((this.colPage + 1) * this.colPageSize, this.visibleColumns.length);
    return `${start}–${end} of ${this.visibleColumns.length} columns`;
  }

  get selectableRowCount(): number {
    return this.rows.filter(r => !r.disabled && r.selectable !== false).length;
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.filterValues).some(v => {
      if (v === null || v === undefined || v === '') return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object') return Object.values(v).some(x => x !== '' && x !== null);
      return true;
    });
  }

  get computedActionState(): ActionBarState {
    const hasSelection = this.selectedIds.length > 0;
    const hasEditable = this.selectedIds.some(id => {
      const row = this.rows.find(r => this.pk(r) === id);
      return row?.editable;
    });
    const hasPending = Object.keys(this.pendingChanges).length > 0;
    const editing = this.tableConfig?.editing?.enabled !== false && !this.tableReadonly && !this.tableDisabled;

    return {
      edit:    !editing ? 'not_available' : hasSelection && hasEditable ? 'enabled' : 'disabled',
      delete:  !(this.tableConfig?.actions?.delete ?? true) ? 'not_available' : hasSelection ? 'enabled' : 'disabled',
      enable:  !(this.tableConfig?.actions?.enable ?? true) ? 'not_available' : hasSelection ? 'enabled' : 'disabled',
      disable: !(this.tableConfig?.actions?.disable ?? true) ? 'not_available' : hasSelection ? 'enabled' : 'disabled',
      revert:  !(this.tableConfig?.actions?.revert ?? true) ? 'not_available' : hasPending ? 'enabled' : 'disabled',
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROW STATE RESOLUTION
  // ═══════════════════════════════════════════════════════════════════

  pk(row: any): string {
    return row[this.primaryKey] ?? row['id'] ?? '';
  }

  resolveRowState(row: any): 'disabled' | 'unavailable' | 'editing' | 'default' {
    if (row.disabled) return 'disabled';
    if (row.rowState === 'error' || row.rowState === 'warning') return 'unavailable';
    const id = this.pk(row);
    if (this.editingRows.includes(id)) return 'editing';
    return 'default';
  }

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  isFilterActive(key: string): boolean {
    const v = this.filterValues[key];
    if (!v) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.values(v).some(x => x !== '' && x !== null);
    return true;
  }

  getSortDirection(key: string): 'asc' | 'desc' | null {
    return this.sorts.find(s => s.key === key)?.direction ?? null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SELECTION
  // ═══════════════════════════════════════════════════════════════════

  toggleSelection(id: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedIds.includes(id)) this.selectedIds = [...this.selectedIds, id];
      // Row checked → enter edit mode if editable
      const row = this.rows.find(r => this.pk(r) === id);
      if (row?.editable && !row.disabled && this.tableConfig?.editing?.enabled !== false && !this.tableReadonly) {
        if (!this.editingRows.includes(id)) this.editingRows = [...this.editingRows, id];
      }
    } else {
      this.selectedIds = this.selectedIds.filter(s => s !== id);
      // Row unchecked → discard unsaved changes
      this.editingRows = this.editingRows.filter(e => e !== id);
      delete this.pendingChanges[id];
    }
    this.masterAllSelected = this.selectedIds.length === this.selectableRowCount && this.selectableRowCount > 0;
    this.selectionChange.emit(this.selectedIds);
  }

  onMasterSelect(selectAll: boolean): void {
    this.masterAllSelected = selectAll;
    if (selectAll) {
      this.selectedIds = this.rows
        .filter(r => !r.disabled && r.selectable !== false)
        .map(r => this.pk(r));
      // Put all editable, non-disabled rows into edit mode
      if (this.tableConfig?.editing?.enabled !== false && !this.tableReadonly && !this.tableDisabled) {
        this.editingRows = this.rows
          .filter(r => this.selectedIds.includes(this.pk(r)) && r.editable && !r.disabled)
          .map(r => this.pk(r));
      }
    } else {
      this.selectedIds = [];
      this.editingRows = [];
      this.pendingChanges = {};
      this.masterEditValues = {};
    }
    this.selectionChange.emit(this.selectedIds);
  }

  clearSelection(): void {
    this.selectedIds = [];
    this.editingRows = [];
    this.pendingChanges = {};
    this.masterEditValues = {};
    this.masterAllSelected = false;
    this.selectionChange.emit([]);
  }

  // ═══════════════════════════════════════════════════════════════════
  // CELL EDITING
  // ═══════════════════════════════════════════════════════════════════

  onCellChange(rowId: string, event: { key: string; value: any }): void {
    if (event.key === '__revert__') {
      delete this.pendingChanges[rowId];
      this.cellChanged.emit({ rowId, key: '__revert__', value: event.value });
      return;
    }
    if (!this.pendingChanges[rowId]) this.pendingChanges[rowId] = {};
    this.pendingChanges[rowId][event.key] = event.value;
    this.cellChanged.emit({ rowId, key: event.key, value: event.value });
  }

  onMasterEditChange(key: string, value: any): void {
    // Propagate to all selected editing rows that allow master edit for this column
    const col = this.columns.find(c => c.key === key);
    if (!col?.masterEditAllow) return;
    for (const id of this.editingRows) {
      const row = this.rows.find(r => this.pk(r) === id);
      if (row && row.editable) {
        row[key] = value;
        if (!this.pendingChanges[id]) this.pendingChanges[id] = {};
        this.pendingChanges[id][key] = value;
      }
    }
  }

  clearMasterEdit(): void {
    this.masterEditValues = {};
  }

  // ═══════════════════════════════════════════════════════════════════
  // TOOLBAR ACTIONS
  // ═══════════════════════════════════════════════════════════════════

  onToolbarAction(action: string): void {
    switch (action) {
      case 'edit':
        this.startEditing();
        break;
      case 'delete':
      case 'enable':
      case 'disable':
        this.bulkActionFired.emit({ action, rowIds: [...this.selectedIds] });
        break;
      case 'revert':
        this.revertAll();
        break;
      default:
        this.bulkActionFired.emit({ action, rowIds: [...this.selectedIds] });
    }
  }

  startEditing(): void {
    if (this.tableDisabled || this.tableReadonly) return;
    const newEditing = this.rows
      .filter(r => this.selectedIds.includes(this.pk(r)) && r.editable && !r.disabled)
      .map(r => this.pk(r));
    this.editingRows = [...new Set([...this.editingRows, ...newEditing])];
  }

  stopEditing(): void {
    // Save pending changes before stopping
    for (const [rowId, changes] of Object.entries(this.pendingChanges)) {
      if (Object.keys(changes).length > 0) {
        this.saveRowRequested.emit({ rowId, changes });
      }
    }
    this.editingRows = [];
    this.pendingChanges = {};
  }

  revertAll(): void {
    // Signal each editing row to revert
    for (const id of this.editingRows) {
      this.cellChanged.emit({ rowId: id, key: '__revert__', value: {} });
    }
    this.pendingChanges = {};
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROW ACTIONS
  // ═══════════════════════════════════════════════════════════════════

  buildRowActions(row: any) {
    const cfg = this.tableConfig?.actions ?? this.defaultActions;
    const isEditing = this.editingRows.includes(this.pk(row));
    return [
      ...(cfg.edit    ? [{ key: 'edit',   label: isEditing ? 'Lock (stop editing)' : 'Edit', icon: isEditing ? '🔒' : '✎', requiresEditable: !isEditing }] : []),
      ...(cfg.delete  ? [{ key: 'delete', label: 'Delete', icon: '🗑', requiresDeletable: true }] : []),
      ...(cfg.revert  ? [{ key: 'revert', label: 'Revert changes', icon: '↶' }] : []),
      ...(cfg.more    ? [{ key: 'view',   label: 'View details', icon: '◉' }] : []),
    ];
  }

  onRowAction(event: { action: string; row: any }): void {
    const id = this.pk(event.row);
    switch (event.action) {
      case 'edit':
        if (this.editingRows.includes(id)) {
          // Lock: stop editing this row, save its changes
          const changes = this.pendingChanges[id] ?? {};
          if (Object.keys(changes).length > 0) {
            this.saveRowRequested.emit({ rowId: id, changes });
          }
          this.editingRows = this.editingRows.filter(e => e !== id);
          delete this.pendingChanges[id];
        } else {
          // Start editing this row
          if (!event.row.disabled && event.row.editable && !this.tableReadonly && !this.tableDisabled) {
            this.editingRows = [...this.editingRows, id];
            if (!this.selectedIds.includes(id)) {
              this.selectedIds = [...this.selectedIds, id];
              this.selectionChange.emit(this.selectedIds);
            }
          }
        }
        break;
      case 'revert':
        this.cellChanged.emit({ rowId: id, key: '__revert__', value: {} });
        delete this.pendingChanges[id];
        break;
      default:
        this.rowActionFired.emit(event);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SORT
  // ═══════════════════════════════════════════════════════════════════

  onSort(key: string, direction: 'asc' | 'desc' | null): void {
    let updated: SortState[];
    if (!direction) {
      updated = this.sorts.filter(s => s.key !== key);
    } else if (this.tableConfig?.sorting?.multiple) {
      const existing = this.sorts.filter(s => s.key !== key);
      updated = [...existing, { key, direction }];
    } else {
      updated = direction ? [{ key, direction }] : [];
    }
    this.sortChange.emit(updated);
  }

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN RESIZE
  // ═══════════════════════════════════════════════════════════════════

  onColWidthChange(key: string, widthPx: number): void {
    // Update the column's width in-place so the table reflows consistently
    const col = this.columns.find(c => c.key === key);
    if (col) {
      col.width = widthPx + 'px';
      this.cdr.markForCheck();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // FILTERS
  // ═══════════════════════════════════════════════════════════════════

  onFilterChange(values: FilterValues): void {
    this.filterValues = values;
    this.filterChange.emit(values);
  }

  onFilterClear(): void {
    this.filterValues = {};
    this.filterChange.emit({});
  }

  // ═══════════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════════

  onPageChange(page: number): void { this.pageChange.emit(page); }
  onPageSizeChange(size: number): void { this.pageSizeChange.emit(size); }
  onLoadMore(): void { /* handled by parent if lazy mode enabled */ }

  // ═══════════════════════════════════════════════════════════════════
  // COLUMN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  applyColumnVisibility(visibility: Record<string, boolean>): void {
    const updated = this.columns.map(c => ({
      ...c,
      visible: visibility[c.key] ?? c.visible,
    }));
    this.columnsChanged.emit(updated);
  }

  resetColumnVisibility(): void {
    const reset = this.columns.map(c => ({ ...c, visible: true }));
    this.columnsChanged.emit(reset);
  }

  // ═══════════════════════════════════════════════════════════════════
  // VIEW MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  saveCurrentView(): void {
    const name = `View ${this.savedViews.length + 1}`;
    if (this.savedViews.length < 3) {
      this.savedViews = [...this.savedViews, name];
      this.activeView = name;
      try { localStorage.setItem(`dt_views_${this.title}`, JSON.stringify(this.savedViews)); } catch {}
    }
  }

  resetView(): void {
    this.activeView = '';
    this.filterValues = {};
    this.filterChange.emit({});
    this.sortChange.emit([]);
    const reset = this.columns.map(c => ({ ...c, visible: true }));
    this.columnsChanged.emit(reset);
  }

  private loadSavedViews(): void {
    try {
      const stored = localStorage.getItem(`dt_views_${this.title}`);
      if (stored) this.savedViews = JSON.parse(stored);
    } catch {}
  }

  // ═══════════════════════════════════════════════════════════════════
  // EXPORT / GENERATE / DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════

  onExport(format: 'excel' | 'csv'): void {
    this.exportRequested.emit({ format, rowIds: this.selectedIds });
  }

  onGenerate(): void {
    this.generateRequested.emit();
    // Simulate a generated state (real implementation handled by parent)
    this.generateInfo = {
      generated: true,
      generatedAt: new Date().toLocaleString(),
      generatedBy: 'You',
    };
  }

  onDownload(format: 'excel' | 'csv'): void {
    this.generateInfo = { ...this.generateInfo, downloadedAt: new Date().toLocaleString() };
    this.downloadRequested.emit(format);
  }

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD
  // ═══════════════════════════════════════════════════════════════════

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.fullscreen) this.fullscreen = false;
  }
}
