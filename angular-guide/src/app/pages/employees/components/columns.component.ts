import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrichedColumn } from '../employees.types';

@Component({
  selector: 'columns-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative inline-block text-left group">
      <!-- Trigger Button -->
      <button
        type="button"
        (click)="toggleOpen($event)"
        [ngClass]="{
          'bg-slate-100 border-slate-300 text-slate-900': isOpen,
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': !isOpen
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        [title]="infoNote || 'Columns configuration'"
      >
        <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <span>{{ label }}</span>
        <span class="text-[10px] text-slate-400 font-mono">({{ visibleCount }}/{{ columns.length }})</span>
        <svg
          class="w-3 h-3 text-slate-400 transition-transform shrink-0"
          [class.rotate-180]="isOpen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Hover Tooltip -->
      <div
        *ngIf="infoNote && !isOpen"
        class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[120] whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white shadow-md"
      >
        {{ infoNote }}
      </div>

      <!-- Popover Dropdown -->
      <div
        *ngIf="isOpen"
        [ngClass]="dropdownAlign === 'right' ? 'right-0' : 'left-0'"
        class="absolute top-full mt-1.5 z-[110] w-64 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xl space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between pb-1 border-b border-slate-100">
          <span class="text-xs font-semibold text-slate-800">
            Columns ({{ visibleCount }}/{{ columns.length }})
          </span>
          <button
            type="button"
            (click)="onResetClick($event)"
            class="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            Reset
          </button>
        </div>

        <!-- Search Columns Input -->
        <div class="relative">
          <input
            type="text"
            placeholder="Search columns..."
            [(ngModel)]="searchQuery"
            class="w-full h-6 rounded border border-slate-200 bg-slate-50 px-2 text-[11px] placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>

        <!-- Column Checkbox List with Up/Down Reordering -->
        <div class="max-h-52 overflow-y-auto space-y-1 py-1">
          <div
            *ngFor="let col of filteredColumns; let i = index; let first = first; let last = last"
            class="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-50 text-xs transition-colors group/item"
          >
            <label class="flex items-center gap-2 cursor-pointer flex-1 truncate select-none">
              <input
                type="checkbox"
                [checked]="col.active !== false"
                (change)="toggleColumn.emit(col.key)"
                class="rounded border-slate-300 accent-slate-900 w-3.5 h-3.5 cursor-pointer"
              />
              <span class="truncate text-slate-700" [class.font-semibold]="col.active !== false">
                {{ col.header_name }}
              </span>
            </label>

            <!-- Reorder arrows -->
            <div class="flex items-center gap-0.5 opacity-60 group-hover/item:opacity-100">
              <button
                type="button"
                [disabled]="first"
                (click)="reorderColumn.emit({ colKey: col.key, direction: 'up' })"
                class="w-4 h-4 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer text-[10px]"
                title="Move up"
              >
                ▲
              </button>
              <button
                type="button"
                [disabled]="last"
                (click)="reorderColumn.emit({ colKey: col.key, direction: 'down' })"
                class="w-4 h-4 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer text-[10px]"
                title="Move down"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ColumnsComponent {
  @Input() label = 'Columns';
  @Input() infoNote?: string;
  @Input() columns: EnrichedColumn[] = [];

  @Output() toggleColumn = new EventEmitter<string>();
  @Output() reorderColumn = new EventEmitter<{ colKey: string; direction: 'up' | 'down' }>();
  @Output() resetColumns = new EventEmitter<void>();

  isOpen = false;
  dropdownAlign: 'left' | 'right' = 'left';
  searchQuery = '';

  constructor(private readonly elRef: ElementRef) {}

  get visibleCount(): number {
    return this.columns.filter(c => c.active !== false).length;
  }

  get filteredColumns(): EnrichedColumn[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.columns;
    return this.columns.filter(c => c.header_name.toLowerCase().includes(q));
  }

  toggleOpen(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.isOpen) {
      const rect = this.elRef.nativeElement.getBoundingClientRect();
      const menuWidth = 270;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      this.dropdownAlign = (spaceRight < menuWidth && spaceLeft >= spaceRight) ? 'right' : 'left';
    }
    this.isOpen = !this.isOpen;
  }

  onResetClick(e: MouseEvent): void {
    e.stopPropagation();
    this.resetColumns.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}
