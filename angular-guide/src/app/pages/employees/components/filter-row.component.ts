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

      <!-- Checkbox Column Placeholder -->
      <th
        *ngIf="hasCheckboxColumn"
        style="width: 50px; min-width: 50px; max-width: 50px;"
        class="w-[50px] min-w-[50px] max-w-[50px] px-2 py-2 bg-white sticky left-0 z-30 border-r border-slate-200 text-center"
      >
        <span class="text-[10px] text-slate-300">#</span>
      </th>

      <!-- Dynamic Column Filters -->
      <th
        *ngFor="let col of columns"
        [style.width]="col.computedWidth"
        [style.min-width]="col.computedWidth"
        [style.left]="col.stickyLeft || null"
        [class.sticky]="col.isFrozen"
        [class.z-40]="activeDropdownKey === col.key"
        [class.z-25]="col.isFrozen && activeDropdownKey !== col.key"
        [class.border-r]="col.isFrozen"
        [class.border-slate-200]="col.isFrozen"
        [class.bg-slate-50]="col.isFrozen"
        class="px-2 py-1.5 align-middle font-normal"
      >
        <!-- 1. Text Search Filter (search or multi_search) -->
        <div *ngIf="col.filter_type === 'search' || col.filter_type === 'multi_search'" class="relative">
          <input
            type="text"
            [placeholder]="'Filter ' + col.header_name"
            [value]="activeFilters[col.filter_key] || ''"
            (keyup.enter)="onSearch(col, $any($event.target).value)"
            class="w-full h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-normal"
          />
        </div>

        <!-- 2. Checklist Dropdown Filter (list) -->
        <div *ngIf="col.filter_type === 'list'" class="relative" (click)="$event.stopPropagation()">
          <button
            type="button"
            (click)="toggleDropdown(col.key)"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600 hover:border-slate-300 cursor-pointer"
          >
            <span class="truncate">{{ activeFilters[col.filter_key] ? activeFilters[col.filter_key] : 'All ' + col.header_name }}</span>
            <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Checklist Popover -->
          <div
            *ngIf="activeDropdownKey === col.key"
            class="absolute left-0 top-full mt-1 z-40 w-44 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl space-y-1"
          >
            <div
              (click)="onClearFilter(col)"
              class="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer text-xs text-slate-500 italic"
            >
              Clear Filter
            </div>
            <div
              *ngFor="let item of col.filter_data"
              (click)="onSelectFilter(col, item)"
              class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-xs text-slate-700"
            >
              <input type="checkbox" [checked]="activeFilters[col.filter_key] === item.key" class="rounded border-slate-300 accent-slate-900" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>

        <!-- 3. Date Range Filter (date_range) -->
        <div *ngIf="col.filter_type === 'date_range'">
          <button
            type="button"
            (click)="filterTrigger.emit({ col, action: 'date_range' })"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-500 hover:border-slate-300 cursor-pointer"
          >
            <span>Select Range</span>
            <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
      </th>

      <!-- Action Column Placeholder -->
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
  @Output() filterChange = new EventEmitter<{ col: EnrichedColumn; value: string }>();
  @Output() filterTrigger = new EventEmitter<{ col: EnrichedColumn; action: string }>();

  activeDropdownKey: string | null = null;

  constructor(private readonly elRef: ElementRef) {}

  toggleDropdown(key: string): void {
    this.activeDropdownKey = this.activeDropdownKey === key ? null : key;
  }

  onSearch(col: EnrichedColumn, value: string): void {
    this.filterChange.emit({ col, value: value.trim() });
  }

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
}
