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
        <!-- 1. Simple Search: One simple input text box with search -->
        <div *ngIf="col.filter_type === 'search'" class="w-full">
          <input
            type="text"
            [placeholder]="'Filter ' + col.header_name"
            [value]="getSimpleSearchValue(col.filter_key)"
            (keyup.enter)="onSimpleSearch(col, $any($event.target).value)"
            (blur)="onSimpleSearch(col, $any($event.target).value)"
            class="w-full h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-normal transition-colors"
          />
        </div>

        <!-- 2. Multi Search: User can put multiple search entries within size limits + dropdown -->
        <div *ngIf="col.filter_type === 'multi_search'" class="w-full relative">
          <!-- State A: 0 items added -> Clean inline text input with Enter prompt -->
          <div
            *ngIf="getMultiSearchTags(col.filter_key).length === 0"
            class="flex items-center w-full h-7 rounded-md border border-slate-200 bg-white px-2 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors"
          >
            <input
              #emptyInput
              type="text"
              [placeholder]="'Filter ' + col.header_name + ' (Enter)'"
              (keydown.enter)="addMultiSearchTag(col, emptyInput, $event)"
              class="w-full text-[11px] placeholder:text-slate-400 outline-none bg-transparent font-normal"
            />
          </div>

          <!-- State B: 1 item added -> Fits in cell size limit -->
          <div
            *ngIf="getMultiSearchTags(col.filter_key).length === 1"
            class="flex items-center justify-between w-full h-7 rounded-md border border-slate-200 bg-white px-1.5 gap-1 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors"
          >
            <span class="inline-flex items-center gap-1 max-w-[110px] px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500 text-white truncate shrink-0 shadow-2xs">
              <span class="truncate">{{ getMultiSearchTags(col.filter_key)[0] }}</span>
              <button
                type="button"
                (click)="removeMultiSearchTag(col, 0, $event)"
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
              (keydown.enter)="addMultiSearchTag(col, singleInput, $event)"
              class="flex-1 min-w-[20px] text-[11px] placeholder:text-slate-400 outline-none bg-transparent font-normal"
            />

            <button
              type="button"
              (click)="toggleMultiSearchDropdown(col.key, $event)"
              class="text-slate-400 hover:text-slate-700 shrink-0 text-xs px-1 cursor-pointer"
              title="Open all terms"
            >
              ▾
            </button>
          </div>

          <!-- State C: > 1 items added -> Exceeds compact cell size limits -> Shows badge + dropdown trigger -->
          <div
            *ngIf="getMultiSearchTags(col.filter_key).length > 1"
            (click)="toggleMultiSearchDropdown(col.key, $event)"
            class="flex items-center justify-between w-full h-7 rounded-md border border-slate-200 bg-white px-1.5 cursor-pointer hover:border-slate-300 transition-colors gap-1"
          >
            <div class="flex items-center gap-1 overflow-hidden truncate">
              <span class="inline-flex items-center gap-1 max-w-[85px] px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500 text-white shrink-0 truncate shadow-2xs">
                <span class="truncate">{{ getMultiSearchTags(col.filter_key)[0] }}</span>
                <button
                  type="button"
                  (click)="removeMultiSearchTag(col, 0, $event)"
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

          <!-- Multi Search Dropdown Popover (Matching user's screenshot) -->
          <div
            *ngIf="activeMultiSearchKey === col.key"
            class="absolute left-0 top-full mt-1.5 z-[100] w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl space-y-2.5 whitespace-nowrap"
          >
            <!-- Header -->
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span class="text-xs font-semibold text-slate-800">
                {{ col.header_name }} Filter ({{ getMultiSearchTags(col.filter_key).length }})
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="clearAllMultiSearchTags(col, $event)"
                  class="text-[10px] text-red-500 hover:text-red-700 font-medium cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  (click)="activeMultiSearchKey = null"
                  class="text-slate-400 hover:text-slate-600 text-sm font-bold leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- Pill Tags List (Matches screenshot with blue pills and 'x') -->
            <div class="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-slate-50/80 rounded-lg border border-slate-100 whitespace-normal">
              <span
                *ngFor="let tag of getMultiSearchTags(col.filter_key); let tagIdx = index"
                class="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-2xs transition-colors shrink-0"
              >
                <span>{{ tag }}</span>
                <button
                  type="button"
                  (click)="removeMultiSearchTag(col, tagIdx, $event)"
                  class="text-blue-100 hover:text-white cursor-pointer ml-0.5 text-xs font-bold leading-none"
                  title="Remove"
                >
                  &times;
                </button>
              </span>
            </div>

            <!-- Bottom Entry Input Row (with '+' button matching screenshot) -->
            <div class="flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <input
                #popoverInput
                type="text"
                placeholder="Add search item... (Enter)"
                (keydown.enter)="addMultiSearchTag(col, popoverInput, $event)"
                class="flex-1 h-7 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                (click)="addMultiSearchTag(col, popoverInput, $event)"
                class="h-7 w-7 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs transition-colors cursor-pointer"
                title="Add search item"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Checklist Dropdown Filter (list) -->
        <div *ngIf="col.filter_type === 'list'" class="relative">
          <button
            type="button"
            (click)="toggleDropdown(col.key)"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span class="truncate">{{ activeFilters[col.filter_key] ? activeFilters[col.filter_key] : 'All ' + col.header_name }}</span>
            <svg class="w-3 h-3 text-slate-400 shrink-0 ml-1 transition-transform" [class.rotate-180]="activeDropdownKey === col.key" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Checklist Popover with high z-index -->
          <div
            *ngIf="activeDropdownKey === col.key"
            class="absolute left-0 top-full mt-1.5 z-[100] w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-1 whitespace-nowrap"
          >
            <div
              (click)="onClearFilter(col)"
              class="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-slate-100 cursor-pointer text-xs text-slate-500 italic"
            >
              Clear Filter
            </div>
            <div
              *ngFor="let item of col.filter_data"
              (click)="onSelectFilter(col, item)"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-xs text-slate-700"
            >
              <input type="checkbox" [checked]="activeFilters[col.filter_key] === item.key" class="rounded border-slate-300 accent-slate-900 pointer-events-none" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>

        <!-- 4. Date Range Filter (date_range) -->
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

  constructor(private readonly elRef: ElementRef) {}

  toggleDropdown(key: string): void {
    this.activeDropdownKey = this.activeDropdownKey === key ? null : key;
    this.activeMultiSearchKey = null;
  }

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

  // ── Multi Search: Multiple entries management ──────────────────────────────
  getMultiSearchTags(filterKey: string): string[] {
    const val = this.activeFilters[filterKey];
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [String(val)];
  }

  addMultiSearchTag(col: EnrichedColumn, inputEl: HTMLInputElement, e: Event): void {
    e.preventDefault();
    if (e) e.stopPropagation();
    const term = inputEl.value.trim();
    if (!term) return;
    const current = [...this.getMultiSearchTags(col.filter_key)];
    if (!current.includes(term)) {
      current.push(term);
      this.filterChange.emit({ col, value: current });
    }
    inputEl.value = '';
  }

  removeMultiSearchTag(col: EnrichedColumn, idx: number, e?: Event): void {
    if (e) e.stopPropagation();
    const current = [...this.getMultiSearchTags(col.filter_key)];
    current.splice(idx, 1);
    this.filterChange.emit({ col, value: current });
  }

  clearAllMultiSearchTags(col: EnrichedColumn, e?: Event): void {
    if (e) e.stopPropagation();
    this.filterChange.emit({ col, value: [] });
  }

  toggleMultiSearchDropdown(key: string, e?: Event): void {
    if (e) e.stopPropagation();
    this.activeMultiSearchKey = this.activeMultiSearchKey === key ? null : key;
    this.activeDropdownKey = null;
  }

  // ── Checklist Dropdown Filters ─────────────────────────────────────────────
  onSelectFilter(col: EnrichedColumn, item: FilterDataItem): void {
    this.activeDropdownKey = null;
    this.filterChange.emit({ col, value: item.key });
  }

  onClearFilter(col: EnrichedColumn): void {
    this.activeDropdownKey = null;
    this.filterChange.emit({ col, value: '' });
  }

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
