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
        [class.z-50]="isColActivePop(col.key)"
        [class.z-20]="col.isFrozen && !isColActivePop(col.key)"
        [class.z-0]="!col.isFrozen && !isColActivePop(col.key)"
        [class.border-r]="col.isFrozen"
        [class.border-slate-200]="col.isFrozen"
        [class.bg-slate-50]="col.isFrozen"
        [class.bg-white]="!col.isFrozen"
        class="px-2 py-1.5 align-middle font-normal"
      >
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 1. SINGLE SEARCH (aka search)                                   -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'search' || col.filter_type === 'single_search'" class="w-full">
          <div
            *ngIf="getSimpleSearchValue(col.filter_key); else emptySimpleSearch"
            class="flex items-center w-full h-7 rounded-md border border-slate-200 bg-white px-1.5"
          >
            <span class="inline-flex items-center gap-1.5 max-w-full px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/90 truncate">
              <span class="truncate">{{ getSimpleSearchValue(col.filter_key) }}</span>
              <button
                type="button"
                (click)="clearSimpleSearch(col, $event)"
                class="text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5 leading-none font-bold text-xs"
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
              class="w-full h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 font-normal transition-colors"
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
            class="flex items-center justify-between w-full h-7 rounded-md border border-slate-200 bg-white px-1.5 gap-1 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300 transition-colors"
          >
            <span class="inline-flex items-center gap-1 max-w-[110px] px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200/90 truncate shrink-0">
              <span class="truncate">{{ getMultiSearchTags(col.filter_key)[0] }}</span>
              <button
                type="button"
                (click)="removeMultiSearchTagDirect(col, 0, $event)"
                class="text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5 leading-none"
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
              class="flex-1 min-w-[20px] text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-normal"
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
              <span class="inline-flex items-center gap-1 max-w-[85px] px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200/90 shrink-0 truncate">
                <span class="truncate">{{ getMultiSearchTags(col.filter_key)[0] }}</span>
                <button
                  type="button"
                  (click)="removeMultiSearchTagDirect(col, 0, $event)"
                  class="text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5 leading-none"
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
                  class="h-5 px-1.5 rounded bg-[#436CF3] hover:bg-[#365BD4] text-white font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
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
                  class="inline-flex items-center gap-1.5 bg-[#436CF3] hover:bg-[#365BD4] text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-2xs transition-colors shrink-0"
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
        <!-- 3. SINGLE DATE                                                  -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'single_date'" class="w-full">
          <div
            *ngIf="getSingleDateValue(col.filter_key); else emptySingleDate"
            class="flex items-center w-full h-7 rounded-md border border-slate-200 bg-white px-1.5"
          >
            <span class="inline-flex items-center gap-1.5 max-w-full px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/90 truncate">
              <span class="truncate">{{ getSingleDateValue(col.filter_key) }}</span>
              <button
                type="button"
                (click)="clearSingleDate(col, $event)"
                class="text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5 leading-none font-bold text-xs"
                title="Clear filter"
              >
                &times;
              </button>
            </span>
          </div>

          <ng-template #emptySingleDate>
            <input
              type="date"
              (change)="onSingleDateChange(col, $any($event.target).value)"
              class="w-full h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 font-normal transition-colors cursor-pointer"
            />
          </ng-template>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 4. DATE RANGE: Selector Trigger & Popover                       -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'date_range'" class="w-full relative">
          <!-- Button trigger -->
          <button
            type="button"
            (click)="toggleDateRangeDropdown(col, $event)"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span class="truncate font-medium">{{ getDateRangeDisplayLabel(col) }}</span>
            <svg class="w-3 h-3 text-slate-400 shrink-0 ml-1 transition-transform" [class.rotate-180]="activeDateRangeKey === col.key" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
            </svg>
          </button>

          <!-- Popover -->
          <div
            *ngIf="activeDateRangeKey === col.key"
            class="absolute left-0 top-full mt-1.5 z-[100] w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl space-y-2.5 whitespace-nowrap"
          >
            <div class="flex items-center justify-between pb-1 border-b border-slate-100">
              <span class="text-xs font-semibold text-slate-800">
                Filter {{ col.header_name }} Range
              </span>
              <button
                type="button"
                (click)="activeDateRangeKey = null"
                class="text-slate-400 hover:text-slate-600 text-sm font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <!-- Presets -->
            <div class="flex flex-wrap gap-1">
              <button
                *ngFor="let p of dateRangePresets"
                type="button"
                (click)="applyDatePreset(col, p.key)"
                class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {{ p.label }}
              </button>
            </div>

            <!-- Date inputs -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">From</label>
                <input
                  type="date"
                  [value]="getPendingDateRange(col.key).from"
                  (input)="setPendingDateRangeFrom(col.key, $any($event.target).value)"
                  class="w-full h-7 rounded border border-slate-200 px-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">To</label>
                <input
                  type="date"
                  [value]="getPendingDateRange(col.key).to"
                  (input)="setPendingDateRangeTo(col.key, $any($event.target).value)"
                  class="w-full h-7 rounded border border-slate-200 px-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 bg-white">
              <button
                type="button"
                (click)="clearDateRange(col)"
                class="text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="activeDateRangeKey = null"
                  class="px-2.5 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="applyDateRange(col)"
                  class="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 5. SINGLE NUMBER                                                -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'single_number'" class="w-full">
          <div
            *ngIf="getSingleNumberValue(col.filter_key); else emptySingleNumber"
            class="flex items-center w-full h-7 rounded-md border border-slate-200 bg-white px-1.5"
          >
            <span class="inline-flex items-center gap-1.5 max-w-full px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#436CF3] text-white truncate shadow-2xs">
              <span class="truncate">{{ getSingleNumberValue(col.filter_key) }}</span>
              <button
                type="button"
                (click)="clearSingleNumber(col, $event)"
                class="text-blue-100 hover:text-white cursor-pointer ml-0.5 leading-none font-bold text-xs"
                title="Clear filter"
              >
                &times;
              </button>
            </span>
          </div>

          <ng-template #emptySingleNumber>
            <input
              type="number"
              [placeholder]="'Filter ' + col.header_name"
              (keydown.enter)="onSingleNumberSearch(col, $any($event.target).value)"
              (blur)="onSingleNumberSearch(col, $any($event.target).value)"
              class="w-full h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-normal transition-colors"
            />
          </ng-template>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 6. NUMBER RANGE: Min & Max Popover                             -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'number_range'" class="w-full relative">
          <!-- Button trigger -->
          <button
            type="button"
            (click)="toggleNumberRangeDropdown(col, $event)"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span class="truncate font-medium">{{ getNumberRangeDisplayLabel(col) }}</span>
            <span class="text-slate-400 text-xs shrink-0 ml-1 transition-transform" [class.rotate-180]="activeNumberRangeKey === col.key">▾</span>
          </button>

          <!-- Popover -->
          <div
            *ngIf="activeNumberRangeKey === col.key"
            class="absolute left-0 top-full mt-1.5 z-[100] w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl space-y-2.5 whitespace-nowrap"
          >
            <div class="flex items-center justify-between pb-1 border-b border-slate-100">
              <span class="text-xs font-semibold text-slate-800">
                Filter {{ col.header_name }} Range
              </span>
              <button
                type="button"
                (click)="activeNumberRangeKey = null"
                class="text-slate-400 hover:text-slate-600 text-sm font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <!-- Number inputs -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Min</label>
                <input
                  type="number"
                  placeholder="Min"
                  [value]="getPendingNumberRange(col.key).min"
                  (input)="setPendingNumberRangeMin(col.key, $any($event.target).value)"
                  class="w-full h-7 rounded border border-slate-200 px-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Max</label>
                <input
                  type="number"
                  placeholder="Max"
                  [value]="getPendingNumberRange(col.key).max"
                  (input)="setPendingNumberRangeMax(col.key, $any($event.target).value)"
                  class="w-full h-7 rounded border border-slate-200 px-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 bg-white">
              <button
                type="button"
                (click)="clearNumberRange(col)"
                class="text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="activeNumberRangeKey = null"
                  class="px-2.5 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="applyNumberRange(col)"
                  class="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- 7. DROPDOWNS WITH CHECKBOXES (list / dropdown_checkboxes)      -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'list' || col.filter_type === 'dropdown_checkboxes' || col.filter_type === 'dropdown_checkbox'" class="relative">
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
        <!-- 8. DROPDOWNS WITH RADIOBUTTONS (dropdown_radiobuttons)          -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div *ngIf="col.filter_type === 'dropdown_radiobuttons' || col.filter_type === 'dropdown_radio'" class="relative">
          <!-- Dropdown Trigger Button -->
          <button
            type="button"
            (click)="toggleRadioDropdown(col)"
            class="flex w-full h-7 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span class="truncate font-medium">{{ getRadioDisplayLabel(col) }}</span>
            <svg class="w-3 h-3 text-slate-400 shrink-0 ml-1 transition-transform" [class.rotate-180]="activeRadioKey === col.key" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Radio Filter Popover -->
          <div
            *ngIf="activeRadioKey === col.key"
            class="absolute left-0 top-full mt-1.5 z-[100] w-56 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xl space-y-2 whitespace-nowrap"
          >
            <!-- 1. Header info -->
            <div class="flex items-center justify-between pb-1 border-b border-slate-100">
              <span class="text-xs font-semibold text-slate-800">
                Filter {{ col.header_name }}
              </span>
              <button
                type="button"
                (click)="activeRadioKey = null"
                class="text-slate-400 hover:text-slate-600 text-sm font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <!-- 2. Search -->
            <div class="relative">
              <div class="flex items-center gap-1.5 h-7 rounded-md border border-slate-200 bg-slate-50 px-2 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-900 transition-colors">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search options..."
                  [value]="getRadioSearchQuery(col.key)"
                  (input)="setRadioSearchQuery(col.key, $any($event.target).value)"
                  class="flex-1 text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-normal"
                />
                <button
                  *ngIf="getRadioSearchQuery(col.key)"
                  type="button"
                  (click)="setRadioSearchQuery(col.key, '')"
                  class="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- 3. Radio Options List -->
            <div class="space-y-1">
              <div class="text-[10px] font-mono font-semibold uppercase text-slate-400">
                Options ({{ getFilteredRadioOptions(col).length }})
              </div>
              <div class="max-h-44 overflow-y-auto p-1 space-y-0.5 bg-slate-50/60 rounded-lg border border-slate-100">
                <div
                  *ngFor="let item of getFilteredRadioOptions(col)"
                  (click)="setRadioOptionPending(col, item.key)"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 cursor-pointer text-xs text-slate-700 transition-colors select-none"
                >
                  <input
                    type="radio"
                    [name]="'radio_filter_' + col.key"
                    [checked]="pendingRadioSelections[col.key] === item.key"
                    class="accent-slate-900 pointer-events-none w-3.5 h-3.5"
                  />
                  <span class="flex-1 truncate font-medium">{{ item.name }}</span>
                </div>

                <div *ngIf="getFilteredRadioOptions(col).length === 0" class="px-2 py-3 text-center text-[11px] text-slate-400">
                  No matching options
                </div>
              </div>
            </div>

            <!-- 4. Action buttons -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 bg-white">
              <button
                type="button"
                (click)="clearRadioPending(col)"
                class="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="activeRadioKey = null"
                  class="px-2.5 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="applyRadioFilter(col)"
                  class="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

      </th>

      <!-- Action Column Placeholder (Sticky right, z-30, opaque) -->
      <th
        *ngIf="hasActionColumn"
        style="width: 130px; min-width: 130px; max-width: 130px;"
        class="w-[130px] min-w-[130px] max-w-[130px] px-2 py-2 bg-white sticky right-0 z-30 border-l border-slate-200 text-center shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]"
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
  @Output() filterChange = new EventEmitter<{ col: EnrichedColumn; value: any }>();
  @Output() filterTrigger = new EventEmitter<{ col: EnrichedColumn; action: string }>();

  // Active popover trackers
  activeDropdownKey: string | null = null;
  activeMultiSearchKey: string | null = null;
  activeDateRangeKey: string | null = null;
  activeNumberRangeKey: string | null = null;
  activeRadioKey: string | null = null;

  // Local Search queries inside dropdowns
  listSearchQueries: Record<string, string> = {};
  multiSearchQueries: Record<string, string> = {};
  radioSearchQueries: Record<string, string> = {};

  // Pending selection buffers before [Apply] is clicked
  pendingListSelections: Record<string, string[]> = {};
  pendingMultiSearchTags: Record<string, string[]> = {};
  pendingDateRange: Record<string, { from: string; to: string }> = {};
  pendingNumberRange: Record<string, { min: string; max: string }> = {};
  pendingRadioSelections: Record<string, string> = {};

  // Date Range Presets
  dateRangePresets = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7', label: 'Last 7 Days' },
    { key: 'last30', label: 'Last 30 Days' },
    { key: 'this_month', label: 'This Month' },
  ];

  constructor(private readonly elRef: ElementRef) {}

  isColActivePop(key: string): boolean {
    return (
      this.activeDropdownKey === key ||
      this.activeMultiSearchKey === key ||
      this.activeDateRangeKey === key ||
      this.activeNumberRangeKey === key ||
      this.activeRadioKey === key
    );
  }

  private closeAllPops(): void {
    this.activeDropdownKey = null;
    this.activeMultiSearchKey = null;
    this.activeDateRangeKey = null;
    this.activeNumberRangeKey = null;
    this.activeRadioKey = null;
  }

  // ── 1. Simple Search ──────────────────────────────────────────────────────────
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
    if (e) e.stopPropagation();
    this.filterChange.emit({ col, value: '' });
  }

  // ── 2. Multi Search Component ────────────────────────────────────────────────
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
    this.closeAllPops();
    this.activeMultiSearchKey = col.key;
    this.multiSearchQueries[col.key] = '';
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

  // ── 3. Single Date ─────────────────────────────────────────────────────────
  getSingleDateValue(filterKey: string): string {
    const val = this.activeFilters[filterKey];
    if (val === undefined || val === null) return '';
    return Array.isArray(val) ? String(val[0] || '') : String(val);
  }

  onSingleDateChange(col: EnrichedColumn, val: string): void {
    const trimmed = (val || '').trim();
    this.filterChange.emit({ col, value: trimmed });
  }

  clearSingleDate(col: EnrichedColumn, e?: Event): void {
    if (e) e.stopPropagation();
    this.filterChange.emit({ col, value: '' });
  }

  // ── 4. Date Range ──────────────────────────────────────────────────────────
  toggleDateRangeDropdown(col: EnrichedColumn, e?: Event): void {
    if (e) e.stopPropagation();
    if (this.activeDateRangeKey === col.key) {
      this.activeDateRangeKey = null;
      return;
    }
    this.closeAllPops();
    this.activeDateRangeKey = col.key;

    // Load active value into pending
    const active = this.activeFilters[col.filter_key];
    let from = '';
    let to = '';
    if (Array.isArray(active)) {
      from = active[0] || '';
      to = active[1] || '';
    } else if (typeof active === 'object' && active) {
      from = active.from || active.start || '';
      to = active.to || active.end || '';
    } else if (typeof active === 'string' && active) {
      from = active;
      to = active;
    }
    this.pendingDateRange[col.key] = { from, to };
  }

  getPendingDateRange(colKey: string): { from: string; to: string } {
    return this.pendingDateRange[colKey] || { from: '', to: '' };
  }

  setPendingDateRangeFrom(colKey: string, from: string): void {
    const curr = this.getPendingDateRange(colKey);
    this.pendingDateRange[colKey] = { ...curr, from };
  }

  setPendingDateRangeTo(colKey: string, to: string): void {
    const curr = this.getPendingDateRange(colKey);
    this.pendingDateRange[colKey] = { ...curr, to };
  }

  applyDatePreset(col: EnrichedColumn, presetKey: string): void {
    const today = new Date();
    const toIso = (d: Date) => d.toISOString().split('T')[0];

    let fromStr = '';
    let toStr = toIso(today);

    if (presetKey === 'today') {
      fromStr = toIso(today);
    } else if (presetKey === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      fromStr = toIso(y);
      toStr = toIso(y);
    } else if (presetKey === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      fromStr = toIso(d);
    } else if (presetKey === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      fromStr = toIso(d);
    } else if (presetKey === 'this_month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      fromStr = toIso(d);
    }

    this.pendingDateRange[col.key] = { from: fromStr, to: toStr };
  }

  clearDateRange(col: EnrichedColumn): void {
    this.pendingDateRange[col.key] = { from: '', to: '' };
    this.activeDateRangeKey = null;
    this.filterChange.emit({ col, value: '' });
  }

  applyDateRange(col: EnrichedColumn): void {
    const range = this.getPendingDateRange(col.key);
    this.activeDateRangeKey = null;
    if (!range.from && !range.to) {
      this.filterChange.emit({ col, value: '' });
    } else {
      this.filterChange.emit({ col, value: [range.from, range.to] });
    }
  }

  getDateRangeDisplayLabel(col: EnrichedColumn): string {
    const active = this.activeFilters[col.filter_key];
    if (!active) return 'Select Date Range';
    if (Array.isArray(active) && active.length > 0) {
      if (active[0] && active[1]) return `${active[0]} → ${active[1]}`;
      if (active[0]) return `From ${active[0]}`;
      if (active[1]) return `To ${active[1]}`;
    }
    return String(active);
  }

  // ── 5. Single Number ───────────────────────────────────────────────────────
  getSingleNumberValue(filterKey: string): string {
    const val = this.activeFilters[filterKey];
    if (val === undefined || val === null || val === '') return '';
    return String(val);
  }

  onSingleNumberSearch(col: EnrichedColumn, value: string): void {
    const trimmed = (value || '').trim();
    if (trimmed !== this.getSingleNumberValue(col.filter_key)) {
      this.filterChange.emit({ col, value: trimmed });
    }
  }

  clearSingleNumber(col: EnrichedColumn, e?: Event): void {
    if (e) e.stopPropagation();
    this.filterChange.emit({ col, value: '' });
  }

  // ── 6. Number Range ────────────────────────────────────────────────────────
  toggleNumberRangeDropdown(col: EnrichedColumn, e?: Event): void {
    if (e) e.stopPropagation();
    if (this.activeNumberRangeKey === col.key) {
      this.activeNumberRangeKey = null;
      return;
    }
    this.closeAllPops();
    this.activeNumberRangeKey = col.key;

    const active = this.activeFilters[col.filter_key];
    let min = '';
    let max = '';
    if (Array.isArray(active)) {
      min = active[0] !== undefined ? String(active[0]) : '';
      max = active[1] !== undefined ? String(active[1]) : '';
    } else if (typeof active === 'object' && active) {
      min = active.min !== undefined ? String(active.min) : '';
      max = active.max !== undefined ? String(active.max) : '';
    } else if (typeof active === 'string' && active.includes('-')) {
      const parts = active.split('-');
      min = parts[0]?.trim() || '';
      max = parts[1]?.trim() || '';
    }
    this.pendingNumberRange[col.key] = { min, max };
  }

  getPendingNumberRange(colKey: string): { min: string; max: string } {
    return this.pendingNumberRange[colKey] || { min: '', max: '' };
  }

  setPendingNumberRangeMin(colKey: string, min: string): void {
    const curr = this.getPendingNumberRange(colKey);
    this.pendingNumberRange[colKey] = { ...curr, min };
  }

  setPendingNumberRangeMax(colKey: string, max: string): void {
    const curr = this.getPendingNumberRange(colKey);
    this.pendingNumberRange[colKey] = { ...curr, max };
  }

  clearNumberRange(col: EnrichedColumn): void {
    this.pendingNumberRange[col.key] = { min: '', max: '' };
    this.activeNumberRangeKey = null;
    this.filterChange.emit({ col, value: '' });
  }

  applyNumberRange(col: EnrichedColumn): void {
    const range = this.getPendingNumberRange(col.key);
    this.activeNumberRangeKey = null;
    if (!range.min && !range.max) {
      this.filterChange.emit({ col, value: '' });
    } else {
      this.filterChange.emit({ col, value: [range.min, range.max] });
    }
  }

  getNumberRangeDisplayLabel(col: EnrichedColumn): string {
    const active = this.activeFilters[col.filter_key];
    if (!active) return 'Number Range';
    if (Array.isArray(active) && active.length > 0) {
      if (active[0] && active[1]) return `${active[0]} – ${active[1]}`;
      if (active[0]) return `≥ ${active[0]}`;
      if (active[1]) return `≤ ${active[1]}`;
    }
    return String(active);
  }

  // ── 7. List Dropdown Filters (Checkboxes) ──────────────────────────────────
  toggleListDropdown(col: EnrichedColumn): void {
    if (this.activeDropdownKey === col.key) {
      this.activeDropdownKey = null;
      return;
    }
    this.closeAllPops();
    this.activeDropdownKey = col.key;
    this.listSearchQueries[col.key] = '';

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

  // ── 8. Radio Dropdown Filters ──────────────────────────────────────────────
  toggleRadioDropdown(col: EnrichedColumn): void {
    if (this.activeRadioKey === col.key) {
      this.activeRadioKey = null;
      return;
    }
    this.closeAllPops();
    this.activeRadioKey = col.key;
    this.radioSearchQueries[col.key] = '';

    const active = this.activeFilters[col.filter_key];
    if (Array.isArray(active)) {
      this.pendingRadioSelections[col.key] = active[0] || '';
    } else if (active !== undefined && active !== null && active !== '') {
      this.pendingRadioSelections[col.key] = String(active);
    } else {
      this.pendingRadioSelections[col.key] = '';
    }
  }

  getRadioSearchQuery(colKey: string): string {
    return this.radioSearchQueries[colKey] || '';
  }

  setRadioSearchQuery(colKey: string, q: string): void {
    this.radioSearchQueries[colKey] = q;
  }

  getFilteredRadioOptions(col: EnrichedColumn): FilterDataItem[] {
    const all = col.filter_data || [];
    const q = this.getRadioSearchQuery(col.key).trim().toLowerCase();
    if (!q) return all;
    return all.filter(opt => opt.name.toLowerCase().includes(q) || opt.key.toLowerCase().includes(q));
  }

  setRadioOptionPending(col: EnrichedColumn, itemKey: string): void {
    this.pendingRadioSelections[col.key] = itemKey;
  }

  clearRadioPending(col: EnrichedColumn): void {
    this.pendingRadioSelections[col.key] = '';
  }

  applyRadioFilter(col: EnrichedColumn): void {
    const selection = this.pendingRadioSelections[col.key] || '';
    this.activeRadioKey = null;
    this.filterChange.emit({ col, value: selection });
  }

  getRadioDisplayLabel(col: EnrichedColumn): string {
    const active = this.activeFilters[col.filter_key];
    if (!active) {
      return 'All ' + col.header_name;
    }
    const key = Array.isArray(active) ? active[0] : active;
    const found = (col.filter_data || []).find(d => d.key === key);
    return found ? found.name : String(key);
  }

  // ── Global Dismissal ───────────────────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (
      (this.activeDropdownKey ||
        this.activeMultiSearchKey ||
        this.activeDateRangeKey ||
        this.activeNumberRangeKey ||
        this.activeRadioKey) &&
      !this.elRef.nativeElement.contains(e.target as Node)
    ) {
      this.closeAllPops();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllPops();
  }
}
