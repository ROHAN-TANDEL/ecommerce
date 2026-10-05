import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type TableDensity = 'compact' | 'regular' | 'comfortable';

export interface ColumnVisibilityItem {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  selector: 'nexora-master-table-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-6 py-3.5 bg-white border-b border-[#EAECF0] flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      <!-- Left: Global Search & Filter Trigger -->
      <div class="flex items-center gap-2.5 flex-1 min-w-[280px] max-w-md">
        <!-- Search Input with Clear Button -->
        <div class="relative w-full">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3] text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            [placeholder]="searchPlaceholder"
            class="w-full pl-8 pr-8 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] hover:border-[#98A2B3] focus:border-[#436CF3] focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EFF4FF] transition-all text-[#101828]"
          />
          @if (searchQuery) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#344054] text-xs cursor-pointer p-0.5"
              title="Clear search"
            >
              ✕
            </button>
          }
        </div>

        <!-- Filter Toggle Button -->
        <button
          type="button"
          (click)="filterToggle.emit()"
          [class]="isFilterActive ? 'border-[#436CF3] bg-[#EFF4FF] text-[#436CF3] font-semibold' : 'border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]'"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <span>⚡ Filters</span>
          @if (activeFilterCount > 0) {
            <span class="w-4 h-4 rounded-full bg-[#436CF3] text-white text-[10px] flex items-center justify-center font-bold">
              {{ activeFilterCount }}
            </span>
          }
        </button>
      </div>

      <!-- Right: Action Controls (Columns, Density, Auto-Refresh, Export, Fullscreen) -->
      <div class="flex items-center gap-2">
        <!-- Columns Manager Popover Button -->
        <div class="relative">
          <button
            type="button"
            (click)="showColumnsMenu = !showColumnsMenu"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] font-medium transition-colors cursor-pointer shadow-2xs"
            title="Toggle column visibility"
          >
            <span>▤ Columns</span>
            <span class="text-[10px] text-[#98A2B3]">▼</span>
          </button>

          @if (showColumnsMenu) {
            <div class="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#D0D5DD] rounded-xl shadow-lg z-30 p-2.5 space-y-1">
              <div class="flex items-center justify-between pb-2 border-b border-[#F2F4F7] mb-1">
                <span class="text-[11px] font-bold text-[#101828] uppercase">Columns Display</span>
                <button type="button" (click)="resetColumns()" class="text-[10px] text-[#436CF3] hover:underline cursor-pointer">Show All</button>
              </div>
              @for (col of columns; track col.key) {
                <label class="flex items-center justify-between p-1.5 hover:bg-[#F9FAFB] rounded text-xs cursor-pointer text-[#344054]">
                  <span class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      [checked]="col.visible"
                      (change)="toggleColumn(col.key)"
                      class="rounded border-[#D0D5DD] text-[#436CF3] focus:ring-[#436CF3]"
                    />
                    <span>{{ col.label }}</span>
                  </span>
                </label>
              }
            </div>
          }
        </div>

        <!-- Density Switcher -->
        <div class="flex items-center p-0.5 bg-[#F2F4F7] rounded-lg border border-[#EAECF0]">
          <button
            type="button"
            (click)="setDensity('compact')"
            [class]="density === 'compact' ? 'bg-white shadow-2xs text-[#101828] font-bold' : 'text-[#667085] hover:text-[#344054]'"
            class="px-2 py-1 rounded text-[11px] transition-all cursor-pointer"
            title="Compact row height (36px)"
          >
            Compact
          </button>
          <button
            type="button"
            (click)="setDensity('regular')"
            [class]="density === 'regular' ? 'bg-white shadow-2xs text-[#101828] font-bold' : 'text-[#667085] hover:text-[#344054]'"
            class="px-2 py-1 rounded text-[11px] transition-all cursor-pointer"
            title="Regular row height (48px)"
          >
            Regular
          </button>
          <button
            type="button"
            (click)="setDensity('comfortable')"
            [class]="density === 'comfortable' ? 'bg-white shadow-2xs text-[#101828] font-bold' : 'text-[#667085] hover:text-[#344054]'"
            class="px-2 py-1 rounded text-[11px] transition-all cursor-pointer"
            title="Comfortable row height (64px)"
          >
            Comfortable
          </button>
        </div>

        <!-- Auto-Refresh Toggle -->
        <button
          type="button"
          (click)="toggleAutoRefresh()"
          [class]="isAutoRefreshOn ? 'bg-[#EFF4FF] border-[#436CF3] text-[#436CF3]' : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB]'"
          class="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border transition-colors cursor-pointer shadow-2xs"
          title="Auto-refresh timer"
        >
          <span [class.animate-spin]="isAutoRefreshOn">↻</span>
          <span class="text-xs font-medium">{{ isAutoRefreshOn ? 'Syncing' : 'Sync' }}</span>
        </button>

        <!-- Export Dropdown -->
        <div class="relative">
          <button
            type="button"
            (click)="showExportMenu = !showExportMenu"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] font-medium transition-colors cursor-pointer shadow-2xs"
            title="Export data"
          >
            <span>📥 Export</span>
            <span class="text-[10px] text-[#98A2B3]">▼</span>
          </button>

          @if (showExportMenu) {
            <div class="absolute right-0 top-full mt-1.5 w-36 bg-white border border-[#D0D5DD] rounded-xl shadow-lg z-30 p-1.5 space-y-0.5">
              <button
                type="button"
                (click)="exportFormat('csv')"
                class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F9FAFB] text-xs font-medium text-[#344054] cursor-pointer"
              >
                CSV (.csv)
              </button>
              <button
                type="button"
                (click)="exportFormat('xlsx')"
                class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F9FAFB] text-xs font-medium text-[#344054] cursor-pointer"
              >
                Excel (.xlsx)
              </button>
              <button
                type="button"
                (click)="exportFormat('json')"
                class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F9FAFB] text-xs font-medium text-[#344054] cursor-pointer"
              >
                JSON (.json)
              </button>
              <button
                type="button"
                (click)="exportFormat('pdf')"
                class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F9FAFB] text-xs font-medium text-[#344054] cursor-pointer"
              >
                Print PDF
              </button>
            </div>
          }
        </div>

        <!-- Fullscreen Mode Toggle -->
        <button
          type="button"
          (click)="fullscreenToggle.emit()"
          class="p-2 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#667085] hover:text-[#101828] cursor-pointer shadow-2xs"
          title="Toggle table fullscreen mode"
        >
          ⛶
        </button>
      </div>
    </div>
  `
})
export class MasterTableToolbarComponent {
  @Input() searchQuery = '';
  @Input() searchPlaceholder = 'Search records by name, email, country, or code...';
  @Input() isFilterActive = false;
  @Input() activeFilterCount = 0;
  @Input() density: TableDensity = 'regular';
  @Input() isAutoRefreshOn = false;
  @Input() columns: ColumnVisibilityItem[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterToggle = new EventEmitter<void>();
  @Output() densityChange = new EventEmitter<TableDensity>();
  @Output() autoRefreshToggle = new EventEmitter<boolean>();
  @Output() export = new EventEmitter<'csv' | 'xlsx' | 'json' | 'pdf'>();
  @Output() fullscreenToggle = new EventEmitter<void>();
  @Output() columnVisibilityChange = new EventEmitter<ColumnVisibilityItem[]>();

  showColumnsMenu = false;
  showExportMenu = false;

  onSearchChange(query: string) {
    this.searchChange.emit(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchChange.emit('');
  }

  setDensity(d: TableDensity) {
    this.density = d;
    this.densityChange.emit(d);
  }

  toggleAutoRefresh() {
    this.isAutoRefreshOn = !this.isAutoRefreshOn;
    this.autoRefreshToggle.emit(this.isAutoRefreshOn);
  }

  exportFormat(format: 'csv' | 'xlsx' | 'json' | 'pdf') {
    this.showExportMenu = false;
    this.export.emit(format);
  }

  toggleColumn(key: string) {
    const col = this.columns.find(c => c.key === key);
    if (col) {
      col.visible = !col.visible;
      this.columnVisibilityChange.emit(this.columns);
    }
  }

  resetColumns() {
    this.columns.forEach(c => c.visible = true);
    this.columnVisibilityChange.emit(this.columns);
  }
}
