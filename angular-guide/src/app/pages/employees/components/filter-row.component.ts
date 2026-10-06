import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrichedColumn, FilterDataItem } from '../employees.types';

@Component({
  selector: 'filter-row-component',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
  template: `
    <tr class="bg-white border-b border-slate-200 text-xs">

      <!-- Checkbox Column Placeholder (Sticky left, z-30, opaque) -->
      <th
        *ngIf="hasCheckboxColumn"
        style="width: 50px; min-width: 50px; max-width: 50px;"
        class="w-[50px] min-w-[50px] max-w-[50px] px-2 py-2 bg-white sticky left-0 z-30 border-r border-slate-200 text-center"
      >
        <span class="text-[10px] text-slate-300 font-mono">#</span>
      </th>

      <!-- Dynamic Column Filters -->
      <th
        *ngFor="let col of columns"
        [style.width]="col.computedWidth"
        [style.min-width]="col.computedWidth"
        [style.left]="col.stickyLeft || null"
        [class.sticky]="col.isFrozen"
        [class.z-50]="activeDropdownKey === col.key || activeMultiSearchKey === col.key"
        [class.z-20]="col.isFrozen && activeDropdownKey !== col.key && activeMultiSearchKey !== col.key"
        [class.z-0]="!col.isFrozen && activeDropdownKey !== col.key && activeMultiSearchKey !== col.key"
        [class.border-r]="col.isFrozen"
        [class.border-slate-200]="col.isFrozen"
        [class.bg-slate-50]="col.isFrozen"
        [class.bg-white]="!col.isFrozen"
        class="px-2 py-1.5 align-middle font-normal"
      >
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 1. SIMPLE SEARCH: One single input text box                     -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 1. SIMPLE SEARCH: Single search item as pill with cancel         -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'search'" class="w-full">
          <div
            *ngIf="getSimpleSearchValue(col.filter_key); else emptySimpleSearch"
            class="flex items-center w-full h-7 rounded-md border border-slate-200 bg-white px-1.5"
          >
            <span class="inline-flex items-center gap-1.5 max-w-full px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500 text-white truncate shadow-2xs">
              <span class="truncate">{{ getSimpleSearchValue(col.filter_key) }}</span>
              <button
                type="button"
                (click)="clearSimpleSearch(col, $event)"
                class="text-blue-100 hover:text-white cursor-pointer ml-0.5 leading-none font-bold text-xs"
                title="Clear filter"
              >
                &times;
              </button>
            </span>
          </div>

          <ng-template #emptySimpleSearch>
            <input
              type="text"
              [placeholder]="'Filter ' + col.header_name"
              (keydown.enter)="onSimpleSearch(col, $any($event.target).value)"
              (blur)="onSimpleSearch(col, $any($event.target).value)"
              class="w-full h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-normal transition-colors"
            />
          </ng-template>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 2. MULTI SEARCH: Multi items with Search + Content + [Apply]   -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'multi_search'" class="w-full relative">
          <!-- State A: 0 items added -> Clean inline input -->
          <div
            *ngIf="getMultiSearchTags(col.filter_key).length === 0"
            class="flex items-center w-full h-7 rounded-md border border-slate-200 bg-white px-2 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors"
          >
            <input
              #emptyInput
              type="text"
              [placeholder]="'Filter ' + col.header_name + ' (Enter)'"
              (keydown.enter)="addMultiSearchTagDirect(col, emptyInput)"
              class="w-full text-[11px] placeholder:text-slate-400 outline-none bg-transparent font-normal"
            />
          </div>

          <!-- State B: 1 item added -> Fits in compact cell size limit -->
          <div
            *ngIf="getMultiSearchTags(col.filter_key).length === 1"
            class="flex items-center justify-between w-full h-7 rounded-md border border-slate-200 bg-white px-1.5 gap-1 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors"
          >
            <span class="inline-flex items-center gap-1 max-w-[110px] px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500 text-white truncate shrink-0 shadow-2xs">
              <span class="truncate">{{ getMultiSearchTags(col.filter_key)[0] }}</span>
              <button
                type="button"
                (click)="removeMultiSearchTagDirect(col, 0, $event)"
                class="text-blue-100 hover:text-white cursor-pointer ml-0.5 leading-none"
                title="Remove"
              >
                &times;
              </button>
            </span>

            <input
              #singleInput
              type="text"
              placeholder="+ more"
              (keydown.enter)="addMultiSearchTagDirect(col, singleInput)"
              class="flex-1 min-w-[20px] text-[11px] placeholder:text-slate-400 outline-none bg-transparent font-normal"
            />

            <button
              type="button"
              (click)="toggleMultiSearchDropdown(col, $event)"
              class="text-slate-400 hover:text-slate-700 shrink-0 text-xs px-1 cursor-pointer"
              title="Open multi-search dropdown"
            >
              ▾
            </button>
          </div>

          <!-- State C: > 1 items added -> Shows badge and dropdown trigger -->
          <div
            *ngIf="getMultiSearchTags(col.filter_key).length > 1"
            (click)="toggleMultiSearchDropdown(col, $event)"
            class="flex items-center justify-between w-full h-7 rounded-md border border-slate-200 bg-white px-1.5 cursor-pointer hover:border-slate-300 transition-colors gap-1"
          >
            <div class="flex items-center gap-1 overflow-hidden truncate">
              <span class="inline-flex items-center gap-1 max-w-[85px] px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500 text-white shrink-0 truncate shadow-2xs">
                <span class="truncate">{{ getMultiSearchTags(col.filter_key)[0] }}</span>
                <button
                  type="button"
                  (click)="removeMultiSearchTagDirect(col, 0, $event)"
                  class="text-blue-100 hover:text-white cursor-pointer ml-0.5 leading-none"
                  title="Remove"
                >
                  &times;
                </button>
              </span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                +{{ getMultiSearchTags(col.filter_key).length - 1 }} more
              </span>
            </div>
            <span class="text-slate-400 text-xs shrink-0 transition-transform" [class.rotate-180]="activeMultiSearchKey === col.key">▾</span>
          </div>

          <!-- Multi Search Dropdown Popover: Search + Selected Content + [Apply] -->
          <div
            *ngIf="activeMultiSearchKey === col.key"
            class="absolute left-0 top-full mt-1.5 z-[100] w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl space-y-2.5 whitespace-nowrap"
          >
            <!-- 1. Header info & close -->
            <div class="flex items-center justify-between pb-1 border-b border-slate-100">
              <span class="text-xs font-semibold text-slate-800">
                {{ col.header_name }} Filters ({{ getPendingMultiTags(col.key).length }})
              </span>
              <button
                type="button"
                (click)="activeMultiSearchKey = null"
                class="text-slate-400 hover:text-slate-600 text-sm font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <!-- 2. Local Search Input (search) -->
            <div class="relative">
              <div class="flex items-center gap-1.5 h-7 rounded-md border border-slate-200 bg-slate-50 px-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  #multiSearchInput
                  type="text"
                  placeholder="Type to filter or press Enter to add..."
                  [value]="getMultiSearchQuery(col.key)"
                  (input)="setMultiSearchQuery(col.key, $any($event.target).value)"
                  (keydown.enter)="addPendingMultiSearchTag(col, multiSearchInput, $event)"
                  class="flex-1 text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-normal"
                />
                <button
                  type="button"
                  (click)="addPendingMultiSearchTag(col, multiSearchInput, $event)"
                  class="h-5 px-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                  title="Add search item"
                >
                  +
                </button>
              </div>
            </div>

            <!-- 3. Selected Search Content (selected_search_content) -->
            <div class="space-y-1">
              <div class="text-[10px] font-mono font-semibold uppercase text-slate-400">
                Selected Search Items
              </div>
              <div class="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-slate-50/80 rounded-lg border border-slate-100 whitespace-normal min-h-[50px]">
                <span
                  *ngFor="let tag of getFilteredPendingMultiTags(col); let tagIdx = index"
                  class="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-2xs transition-colors shrink-0"
                >
                  <span>{{ tag }}</span>
                  <button
                    type="button"
                    (click)="removePendingMultiSearchTag(col, tag, $event)"
                    class="text-blue-100 hover:text-white cursor-pointer ml-0.5 text-xs font-bold leading-none"
                    title="Remove item"
                  >
                    &times;
                  </button>
                </span>

                <div *ngIf="getFilteredPendingMultiTags(col).length === 0" class="w-full text-center py-3 text-[11px] text-slate-400">
                  {{ getPendingMultiTags(col.key).length === 0 ? 'No items selected yet. Add one above!' : 'No matching items' }}
                </div>
              </div>
            </div>

            <!-- 4. Action bar with [apply] -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 bg-white">
              <button
                type="button"
                (click)="clearPendingMultiSearch(col)"
                class="text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear all
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="activeMultiSearchKey = null"
                  class="px-2.5 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="applyMultiSearch(col)"
                  class="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 3. LIST DROPDOWN: Search + Content + [Apply]                    -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'list'" class="relative">
          <!-- Dropdown Trigger Button -->
          <button
            type="button"
            (click)="toggleListDropdown(col)"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span class="truncate font-medium">{{ getListDisplayLabel(col) }}</span>
            <svg class="w-3 h-3 text-slate-400 shrink-0 ml-1 transition-transform" [class.rotate-180]="activeDropdownKey === col.key" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- List Filter Popover: Search + Selected Content + [Apply] -->
          <div
            *ngIf="activeDropdownKey === col.key"
            class="absolute left-0 top-full mt-1.5 z-[100] w-56 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xl space-y-2 whitespace-nowrap"
          >
            <!-- 1. Header info -->
            <div class="flex items-center justify-between pb-1 border-b border-slate-100">
              <span class="text-xs font-semibold text-slate-800">
                Filter {{ col.header_name }}
              </span>
              <button
                type="button"
                (click)="activeDropdownKey = null"
                class="text-slate-400 hover:text-slate-600 text-sm font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <!-- 2. Local Search Input (search) -->
            <div class="relative">
              <div class="flex items-center gap-1.5 h-7 rounded-md border border-slate-200 bg-slate-50 px-2 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-900 transition-colors">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search options..."
                  [value]="getListSearchQuery(col.key)"
                  (input)="setListSearchQuery(col.key, $any($event.target).value)"
                  class="flex-1 text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-normal"
                />
                <button
                  *ngIf="getListSearchQuery(col.key)"
                  type="button"
                  (click)="setListSearchQuery(col.key, '')"
                  class="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- 3. Selected Search Content (selected_search_content) -->
            <div class="space-y-1">
              <div class="text-[10px] font-mono font-semibold uppercase text-slate-400">
                Options ({{ getFilteredListOptions(col).length }})
              </div>
              <div class="max-h-44 overflow-y-auto p-1 space-y-0.5 bg-slate-50/60 rounded-lg border border-slate-100">
                <div
                  *ngFor="let item of getFilteredListOptions(col)"
                  (click)="toggleListOptionPending(col, item.key)"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 cursor-pointer text-xs text-slate-700 transition-colors select-none"
                >
                  <input
                    type="checkbox"
                    [checked]="isListOptionPendingSelected(col, item.key)"
                    class="rounded border-slate-300 accent-slate-900 pointer-events-none w-3.5 h-3.5"
                  />
                  <span class="flex-1 truncate font-medium">{{ item.name }}</span>
                </div>

                <div *ngIf="getFilteredListOptions(col).length === 0" class="px-2 py-3 text-center text-[11px] text-slate-400">
                  No matching options
                </div>
              </div>
            </div>

            <!-- 4. Action bar with [apply] -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 bg-white">
              <button
                type="button"
                (click)="clearListPending(col)"
                class="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="activeDropdownKey = null"
                  class="px-2.5 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="applyListFilter(col)"
                  class="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 4. DATE RANGE: Selector Trigger                                -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'date_range'">
          <button
            type="button"
            (click)="filterTrigger.emit({ col, action: 'date_range' })"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-500 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span>Select Range</span>
            <svg class="w-3 h-3 text-slate-400 shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
      </th>

      <!-- Action Column Placeholder (Sticky right, z-30, opaque) -->
      <th
        *ngIf="hasActionColumn"
        style="width: 110px; min-width: 110px; max-width: 110px;"
        class="w-[110px] min-w-[110px] max-w-[110px] px-2 py-2 bg-white sticky right-0 z-30 border-l border-slate-200 text-center"
      >
        <svg class="w-3.5 h-3.5 text-slate-300 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.5"></circle>
          <circle cx="12" cy="12" r="1.5"></circle>
          <circle cx="19" cy="12" r="1.5"></circle>
        </svg>
      </th>

    </tr>
  `,
})
export class FilterRowComponent {
  @Input({ required: true }) columns: EnrichedColumn[] = [];
  @Input() activeFilters: Record<string, any> = {};
  @Input() hasCheckboxColumn = true;
  @Input() hasActionColumn = true;
  @Output() filterChange = new EventEmitter<{ col: EnrichedColumn; value: string | string[] }>();
  @Output() filterTrigger = new EventEmitter<{ col: EnrichedColumn; action: string }>();

  activeDropdownKey: string | null = null;
  activeMultiSearchKey: string | null = null;

  // Local Search queries inside dropdowns
  listSearchQueries: Record<string, string> = {};
  multiSearchQueries: Record<string, string> = {};

  // Pending selection buffers before [Apply] is clicked
  pendingListSelections: Record<string, string[]> = {};
  pendingMultiSearchTags: Record<string, string[]> = {};

  constructor(private readonly elRef: ElementRef) {}

  // ── Simple Search ──────────────────────────────────────────────────────────
  getSimpleSearchValue(filterKey: string): string {
    const val = this.activeFilters[filterKey];
    if (val === undefined || val === null) return '';
    return Array.isArray(val) ? val.join(', ') : String(val);
  }

  onSimpleSearch(col: EnrichedColumn, value: string): void {
    const trimmed = value.trim();
    if (trimmed !== this.getSimpleSearchValue(col.filter_key)) {
      this.filterChange.emit({ col, value: trimmed });
    }
  }

  clearSimpleSearch(col: EnrichedColumn, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    this.filterChange.emit({ col, value: '' });
  }

  // ── Multi Search Component ────────────────────────────────────────────────
  getMultiSearchTags(filterKey: string): string[] {
    const val = this.activeFilters[filterKey];
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [String(val)];
  }

  toggleMultiSearchDropdown(col: EnrichedColumn, e?: Event): void {
    if (e) e.stopPropagation();
    if (this.activeMultiSearchKey === col.key) {
      this.activeMultiSearchKey = null;
      return;
    }
    this.activeMultiSearchKey = col.key;
    this.activeDropdownKey = null;
    this.multiSearchQueries[col.key] = '';
    // Initialize pending buffer from current active filter
    this.pendingMultiSearchTags[col.key] = [...this.getMultiSearchTags(col.filter_key)];
  }

  getPendingMultiTags(colKey: string): string[] {
    return this.pendingMultiSearchTags[colKey] || [];
  }

  getMultiSearchQuery(colKey: string): string {
    return this.multiSearchQueries[colKey] || '';
  }

  setMultiSearchQuery(colKey: string, query: string): void {
    this.multiSearchQueries[colKey] = query;
  }

  getFilteredPendingMultiTags(col: EnrichedColumn): string[] {
    const list = this.getPendingMultiTags(col.key);
    const q = this.getMultiSearchQuery(col.key).trim().toLowerCase();
    if (!q) return list;
    return list.filter(t => t.toLowerCase().includes(q));
  }

  addPendingMultiSearchTag(col: EnrichedColumn, inputEl: HTMLInputElement, e?: Event): void {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const term = inputEl.value.trim();
    if (!term) return;
    const current = this.getPendingMultiTags(col.key);
    if (!current.includes(term)) {
      this.pendingMultiSearchTags[col.key] = [...current, term];
    }
    inputEl.value = '';
    this.multiSearchQueries[col.key] = '';
  }

  removePendingMultiSearchTag(col: EnrichedColumn, tag: string, e?: Event): void {
    if (e) e.stopPropagation();
    const current = this.getPendingMultiTags(col.key);
    this.pendingMultiSearchTags[col.key] = current.filter(t => t !== tag);
  }

  clearPendingMultiSearch(col: EnrichedColumn): void {
    this.pendingMultiSearchTags[col.key] = [];
  }

  applyMultiSearch(col: EnrichedColumn): void {
    const tags = this.getPendingMultiTags(col.key);
    this.activeMultiSearchKey = null;
    this.filterChange.emit({ col, value: tags });
  }

  // Direct cell operations for multi_search
  addMultiSearchTagDirect(col: EnrichedColumn, inputEl: HTMLInputElement): void {
    const term = inputEl.value.trim();
    if (!term) return;
    const current = [...this.getMultiSearchTags(col.filter_key)];
    if (!current.includes(term)) {
      current.push(term);
      this.filterChange.emit({ col, value: current });
    }
    inputEl.value = '';
  }

  removeMultiSearchTagDirect(col: EnrichedColumn, idx: number, e?: Event): void {
    if (e) e.stopPropagation();
    const current = [...this.getMultiSearchTags(col.filter_key)];
    current.splice(idx, 1);
    this.filterChange.emit({ col, value: current });
  }

  // ── List Dropdown Filters ─────────────────────────────────────────────────
  toggleListDropdown(col: EnrichedColumn): void {
    if (this.activeDropdownKey === col.key) {
      this.activeDropdownKey = null;
      return;
    }
    this.activeDropdownKey = col.key;
    this.activeMultiSearchKey = null;
    this.listSearchQueries[col.key] = '';

    // Initialize pending selections from current filter
    const active = this.activeFilters[col.filter_key];
    if (Array.isArray(active)) {
      this.pendingListSelections[col.key] = [...active];
    } else if (active !== undefined && active !== null && active !== '') {
      this.pendingListSelections[col.key] = [String(active)];
    } else {
      this.pendingListSelections[col.key] = [];
    }
  }

  getListSearchQuery(colKey: string): string {
    return this.listSearchQueries[colKey] || '';
  }

  setListSearchQuery(colKey: string, q: string): void {
    this.listSearchQueries[colKey] = q;
  }

  getFilteredListOptions(col: EnrichedColumn): FilterDataItem[] {
    const all = col.filter_data || [];
    const q = this.getListSearchQuery(col.key).trim().toLowerCase();
    if (!q) return all;
    return all.filter(opt => opt.name.toLowerCase().includes(q) || opt.key.toLowerCase().includes(q));
  }

  isListOptionPendingSelected(col: EnrichedColumn, itemKey: string): boolean {
    const selections = this.pendingListSelections[col.key] || [];
    return selections.includes(itemKey);
  }

  toggleListOptionPending(col: EnrichedColumn, itemKey: string): void {
    const current = [...(this.pendingListSelections[col.key] || [])];
    const idx = current.indexOf(itemKey);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(itemKey);
    }
    this.pendingListSelections[col.key] = current;
  }

  clearListPending(col: EnrichedColumn): void {
    this.pendingListSelections[col.key] = [];
  }

  applyListFilter(col: EnrichedColumn): void {
    const selections = this.pendingListSelections[col.key] || [];
    this.activeDropdownKey = null;

    if (selections.length === 0) {
      this.filterChange.emit({ col, value: '' });
    } else if (selections.length === 1) {
      this.filterChange.emit({ col, value: selections[0] });
    } else {
      this.filterChange.emit({ col, value: selections });
    }
  }

  getListDisplayLabel(col: EnrichedColumn): string {
    const active = this.activeFilters[col.filter_key];
    if (!active || (Array.isArray(active) && active.length === 0)) {
      return 'All ' + col.header_name;
    }
    if (Array.isArray(active)) {
      if (active.length === 1) {
        const found = (col.filter_data || []).find(d => d.key === active[0]);
        return found ? found.name : active[0];
      }
      return `${active.length} Selected`;
    }
    const found = (col.filter_data || []).find(d => d.key === active);
    return found ? found.name : String(active);
  }

  // ── Global Dismissal ───────────────────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.activeDropdownKey && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.activeDropdownKey = null;
    }
    if (this.activeMultiSearchKey && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.activeMultiSearchKey = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.activeDropdownKey = null;
    this.activeMultiSearchKey = null;
  }
}
