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
        [class.z-50]="activeDropdownKey === col.key"
        [class.z-20]="col.isFrozen && activeDropdownKey !== col.key"
        [class.z-0]="!col.isFrozen && activeDropdownKey !== col.key"
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

        <!-- 2. Multi Search: User can put multiple search entries -->
        <div *ngIf="col.filter_type === 'multi_search'" class="w-full">
          <div class="flex items-center flex-wrap gap-1 min-h-[28px] p-0.5 rounded-md border border-slate-200 bg-white focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors">
            <!-- Active Search Tags/Chips -->
            <span
              *ngFor="let tag of getMultiSearchTags(col.filter_key); let tagIdx = index"
              class="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200 shrink-0"
            >
              <span>{{ tag }}</span>
              <button
                type="button"
                (click)="removeMultiSearchTag(col, tagIdx)"
                class="text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5 leading-none"
                title="Remove search term"
              >
                &times;
              </button>
            </span>

            <!-- Tag Entry Input -->
            <input
              #multiInput
              type="text"
              [placeholder]="getMultiSearchTags(col.filter_key).length === 0 ? 'Filter ' + col.header_name + ' (Enter)' : '+ more'"
              (keydown.enter)="addMultiSearchTag(col, multiInput, $event)"
              (keydown.backspace)="onMultiInputBackspace(col, multiInput, $event)"
              class="flex-1 min-w-[50px] h-6 px-1 text-[11px] placeholder:text-slate-400 outline-none bg-transparent font-normal"
            />
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
            class="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-1 whitespace-nowrap"
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

  constructor(private readonly elRef: ElementRef) {}

  toggleDropdown(key: string): void {
    this.activeDropdownKey = this.activeDropdownKey === key ? null : key;
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
    const term = inputEl.value.trim();
    if (!term) return;
    const current = [...this.getMultiSearchTags(col.filter_key)];
    if (!current.includes(term)) {
      current.push(term);
      this.filterChange.emit({ col, value: current });
    }
    inputEl.value = '';
  }

  removeMultiSearchTag(col: EnrichedColumn, idx: number): void {
    const current = [...this.getMultiSearchTags(col.filter_key)];
    current.splice(idx, 1);
    this.filterChange.emit({ col, value: current });
  }

  onMultiInputBackspace(col: EnrichedColumn, inputEl: HTMLInputElement, e: KeyboardEvent): void {
    if (inputEl.value === '') {
      const current = [...this.getMultiSearchTags(col.filter_key)];
      if (current.length > 0) {
        current.pop();
        this.filterChange.emit({ col, value: current });
      }
    }
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
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.activeDropdownKey = null;
  }
}
