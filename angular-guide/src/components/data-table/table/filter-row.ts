import {
  Component, Input, Output, EventEmitter,
  HostListener, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import type { ColumnDef } from '../models/column-def.model';
import type { FilterValues } from '../models/column-def.model';
import type { FilterDataItem } from '../models/column-config.model';

/**
 * FilterRow — the <tr> filter row rendered inside <thead>.
 *
 * TABLE level · Each <th> is driven by the column's filterType from the API config.
 *
 * Filter types supported (from column-config API):
 *   search        → free text input
 *   list          → checkbox dropdown (single/multi from filter_data)
 *   search_list   → text input + checkbox dropdown
 *   multi_list    → multi-select checkbox dropdown with search
 *   range         → min/max number inputs
 *   date_range    → from/to date inputs
 *   bool          → yes / no / all toggle
 *   none          → empty cell
 *
 * Rules:
 *   • Filter key matches column.key which maps to the API field.
 *   • "Clear" on a dropdown clears only that column's filter values.
 *   • "Apply" fires filterChange with the current values map.
 *   • Up to 3 filter presets can be saved (managed by parent).
 *
 * The component emits on every apply/clear — the parent owns the filter state
 * and re-fetches data. The component owns only open-dropdown UI state.
 */
@Component({
  selector: '[dt-filter-row]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Selection column — empty filter cell -->
    <th *ngIf="showCheckboxes"
      class="w-[54px] px-3 py-2 bg-white"
      [class.sticky]="fixedCheckboxes"
      [class.left-0]="fixedCheckboxes"
      [class.z-[25]]="fixedCheckboxes"
      [class.border-r]="fixedCheckboxes"
      [class.border-r-slate-200]="fixedCheckboxes"></th>

    <!-- Per-column filter cells -->
    <th *ngFor="let col of columns"
      class="px-3 py-2 bg-white"
      [style.width]="col.width"
      [class.sticky]="col.frozen"
      [class.z-[25]]="col.frozen"
      [class.bg-[#EEF2FF]]="col.frozen"
      [class.border-r]="col.frozen && col.frozenSide !== 'right'"
      [class.border-l]="col.frozen && col.frozenSide === 'right'"
      [class.border-slate-200]="col.frozen"
      [style.left]="col.frozen && col.frozenSide !== 'right' ? frozenOffset(col) : null"
      [style.right]="col.frozen && col.frozenSide === 'right' ? frozenOffset(col) : null">

      <!-- ── search ────────────────────────────────────────────── -->
      <ng-container *ngIf="col.filterable && col.filterType === 'search'">
        <div class="relative">
          <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">⌕</span>
          <input type="text"
            class="h-8 w-full rounded-md border border-slate-200 bg-white pl-6 pr-2
                   text-[11px] outline-none placeholder:text-slate-400 focus:border-[#436CF3]"
            [placeholder]="'Search ' + col.label + '…'"
            [ngModel]="values[col.key] || ''"
            (ngModelChange)="patch(col.key, $event)"
            (keydown.enter)="apply()" />
        </div>
      </ng-container>

      <!-- ── list / search_list / multi_list ───────────────────── -->
      <ng-container *ngIf="col.filterable && (col.filterType === 'list' || col.filterType === 'search_list' || col.filterType === 'multi_list')">
        <div class="relative" (click)="$event.stopPropagation()">
          <button type="button"
            class="flex h-8 w-full items-center justify-between rounded-md
                   border border-slate-200 bg-white px-2.5 text-[11px] text-slate-500
                   hover:border-slate-300 transition-colors"
            (click)="toggleDrop(col.key)">
            <span class="truncate">{{ listLabel(col) }}</span>
            <span class="ml-1 shrink-0 text-[9px]">⌄</span>
          </button>

          <div *ngIf="openDrop === col.key"
            class="absolute left-0 top-full z-50 mt-1 min-w-[200px] w-full rounded-lg
                   border border-slate-200 bg-white p-1.5 shadow-xl">

            <!-- Search within list -->
            <div *ngIf="col.filterType === 'search_list' || col.filterType === 'multi_list'"
              class="mb-1.5 px-0.5">
              <input type="text"
                class="h-7 w-full rounded-md border border-slate-200 px-2 text-[11px]
                       outline-none focus:border-[#436CF3]"
                placeholder="Search…"
                [(ngModel)]="dropSearch[col.key]" />
            </div>

            <!-- Options -->
            <div class="max-h-44 overflow-y-auto">
              <label *ngFor="let opt of filteredOpts(col)"
                class="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2
                       text-[11px] text-slate-700 hover:bg-blue-50">
                <input type="checkbox"
                  class="h-3.5 w-3.5 rounded accent-[#436CF3]"
                  [checked]="isChecked(col.key, opt.key)"
                  (change)="toggleOpt(col.key, opt.key)" />
                {{ opt.name }}
              </label>
            </div>

            <div class="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5 px-0.5">
              <button type="button"
                class="text-[10px] text-slate-400 hover:text-slate-600"
                (click)="clearCol(col.key)">Clear</button>
              <button type="button"
                class="rounded-md bg-[#436CF3] px-2.5 py-1 text-[10px] font-medium text-white"
                (click)="apply(); closeDrop()">Apply</button>
            </div>

          </div>
        </div>
      </ng-container>

      <!-- ── range ──────────────────────────────────────────────── -->
      <ng-container *ngIf="col.filterable && col.filterType === 'range'">
        <div class="flex items-center gap-1">
          <input type="text"
            class="h-8 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2
                   text-[11px] outline-none placeholder:text-slate-400 focus:border-[#436CF3]"
            placeholder="Min"
            [ngModel]="rangeMin(col.key)"
            (ngModelChange)="patchRangeMin(col.key, $event)" />
          <span class="shrink-0 text-slate-300 text-[10px]">−</span>
          <input type="text"
            class="h-8 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2
                   text-[11px] outline-none placeholder:text-slate-400 focus:border-[#436CF3]"
            placeholder="Max"
            [ngModel]="rangeMax(col.key)"
            (ngModelChange)="patchRangeMax(col.key, $event)"
            (keydown.enter)="apply()" />
        </div>
      </ng-container>

      <!-- ── date_range ─────────────────────────────────────────── -->
      <ng-container *ngIf="col.filterable && col.filterType === 'date_range'">
        <div class="relative" (click)="$event.stopPropagation()">
          <button type="button"
            class="flex h-8 w-full items-center gap-1.5 rounded-md border border-slate-200
                   bg-white px-2.5 text-[11px] text-slate-500 hover:border-slate-300"
            (click)="toggleDrop(col.key)">
            <span class="text-[10px]">📅</span>
            <span class="truncate">{{ dateRangeLabel(col.key) }}</span>
          </button>
          <div *ngIf="openDrop === col.key"
            class="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border
                   border-slate-200 bg-white p-3 shadow-xl">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="mb-1 block text-[10px] text-slate-400">From</label>
                <input type="date"
                  class="h-8 w-full rounded-md border border-slate-200 px-2 text-[11px]
                         outline-none focus:border-[#436CF3]"
                  [ngModel]="dateFrom(col.key)"
                  (ngModelChange)="patchDateFrom(col.key, $event)" />
              </div>
              <div>
                <label class="mb-1 block text-[10px] text-slate-400">To</label>
                <input type="date"
                  class="h-8 w-full rounded-md border border-slate-200 px-2 text-[11px]
                         outline-none focus:border-[#436CF3]"
                  [ngModel]="dateTo(col.key)"
                  (ngModelChange)="patchDateTo(col.key, $event)" />
              </div>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <button type="button"
                class="text-[10px] text-slate-400 hover:text-slate-600"
                (click)="clearCol(col.key)">Clear</button>
              <button type="button"
                class="rounded-md bg-[#436CF3] px-2.5 py-1 text-[10px] font-medium text-white"
                (click)="apply(); closeDrop()">Apply</button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ── bool ───────────────────────────────────────────────── -->
      <ng-container *ngIf="col.filterable && col.filterType === 'bool'">
        <div class="flex rounded-md border border-slate-200 overflow-hidden h-8">
          <button *ngFor="let opt of boolOpts"
            type="button"
            class="flex-1 text-[10px] font-medium transition-colors"
            [class.bg-[#436CF3]]="values[col.key] === opt.v"
            [class.text-white]="values[col.key] === opt.v"
            [class.text-slate-500]="values[col.key] !== opt.v"
            [class.hover:bg-slate-50]="values[col.key] !== opt.v"
            (click)="patch(col.key, opt.v); apply()">
            {{ opt.label }}
          </button>
        </div>
      </ng-container>

      <!-- ── no filter ──────────────────────────────────────────── -->
      <ng-container *ngIf="!col.filterable || col.filterType === 'none'">
        <div class="h-8"></div>
      </ng-container>

    </th>

    <!-- Actions column — Clear all + Apply -->
    <th *ngIf="showActions" class="w-[120px] px-3 py-2 bg-white"
      [class.sticky]="fixedActions"
      [class.right-0]="fixedActions"
      [class.z-[25]]="fixedActions"
      [class.border-l]="fixedActions"
      [class.border-l-slate-200]="fixedActions">
      <div class="flex items-center gap-1.5">
        <button type="button"
          class="h-8 rounded-md border border-slate-200 bg-white px-2.5
                 text-[10px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          (click)="clearAll()">
          Clear
        </button>
        <button type="button"
          class="h-8 rounded-md bg-[#436CF3] px-2.5 text-[10px] font-medium text-white
                 hover:bg-[#3557d4] transition-colors"
          (click)="apply()">
          Apply
        </button>
      </div>
    </th>
  `,
})
export class FilterRow {
  @Input() columns: ColumnDef[] = [];
  @Input() values: FilterValues = {};
  @Input() showCheckboxes = true;
  @Input() fixedCheckboxes = false;
  @Input() showActions = true;
  @Input() fixedActions = false;
  @Input() frozenOffset: (col: ColumnDef) => string = () => '0px';

  @Output() filterChange = new EventEmitter<FilterValues>();
  @Output() filterClear  = new EventEmitter<void>();

  // ── internal ──────────────────────────────────────────────────────
  openDrop: string | null = null;
  dropSearch: Record<string, string> = {};

  readonly boolOpts = [
    { label: 'All', v: null },
    { label: 'Yes', v: true },
    { label: 'No',  v: false },
  ];

  // ── helpers ───────────────────────────────────────────────────────

  patch(key: string, v: any): void {
    this.values = { ...this.values, [key]: v };
  }

  patchRangeMin(key: string, v: string): void {
    const cur = this.values[key] ?? {};
    this.values = { ...this.values, [key]: { ...cur, min: v } };
  }

  patchRangeMax(key: string, v: string): void {
    const cur = this.values[key] ?? {};
    this.values = { ...this.values, [key]: { ...cur, max: v } };
  }

  patchDateFrom(key: string, v: string): void {
    const cur = this.values[key] ?? {};
    this.values = { ...this.values, [key]: { ...cur, from: v } };
  }

  patchDateTo(key: string, v: string): void {
    const cur = this.values[key] ?? {};
    this.values = { ...this.values, [key]: { ...cur, to: v } };
  }

  rangeMin(key: string): string { return this.values[key]?.min ?? ''; }
  rangeMax(key: string): string { return this.values[key]?.max ?? ''; }
  dateFrom(key: string): string { return this.values[key]?.from ?? ''; }
  dateTo(key: string):   string { return this.values[key]?.to   ?? ''; }

  isChecked(key: string, optKey: string): boolean {
    const v = this.values[key];
    if (!v) return false;
    return Array.isArray(v) ? v.includes(optKey) : v === optKey;
  }

  toggleOpt(key: string, optKey: string): void {
    const cur: string[] = Array.isArray(this.values[key]) ? [...this.values[key]] : [];
    const idx = cur.indexOf(optKey);
    if (idx >= 0) cur.splice(idx, 1); else cur.push(optKey);
    this.values = { ...this.values, [key]: cur };
  }

  filteredOpts(col: ColumnDef): FilterDataItem[] {
    const q = (this.dropSearch[col.key] ?? '').toLowerCase();
    return col.filterData.filter(o => !q || o.name.toLowerCase().includes(q));
  }

  listLabel(col: ColumnDef): string {
    const v = this.values[col.key];
    if (!v || (Array.isArray(v) && v.length === 0)) return `All ${col.label}`;
    if (Array.isArray(v)) return `${v.length} selected`;
    return String(v);
  }

  dateRangeLabel(key: string): string {
    const v = this.values[key];
    if (!v?.from && !v?.to) return 'Select range';
    if (v.from && v.to) return `${v.from} — ${v.to}`;
    return v.from ? `From ${v.from}` : `To ${v.to}`;
  }

  toggleDrop(key: string): void {
    this.openDrop = this.openDrop === key ? null : key;
  }

  closeDrop(): void { this.openDrop = null; }

  clearCol(key: string): void {
    const { [key]: _, ...rest } = this.values;
    this.values = rest;
  }

  clearAll(): void {
    this.values = {};
    this.filterClear.emit();
    this.filterChange.emit({});
  }

  apply(): void {
    this.filterChange.emit({ ...this.values });
  }

  @HostListener('document:click')
  onDocClick(): void { this.openDrop = null; }
}
