import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrichedColumn } from '../employees.types';

@Component({
  selector: 'header-component',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
  template: `
    <th
      [style.width]="column.computedWidth"
      [style.min-width]="column.computedWidth"
      [style.left]="column.stickyLeft || null"
      [class.sticky]="column.isFrozen"
      [class.z-20]="column.isFrozen"
      [class.border-r]="column.isFrozen"
      [class.border-slate-200]="column.isFrozen"
      [class.bg-slate-100]="column.isFrozen"
      class="px-3.5 py-3 select-none transition-colors border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider relative group/th"
    >
      <div class="flex items-center justify-between gap-1.5">
        <div
          class="flex items-center gap-1.5 truncate cursor-pointer group"
          (click)="onSort()"
        >
          <span class="truncate font-medium text-slate-800">{{ column.header_name }}</span>

          <!-- Paired Chevron Sort SVG Indicator -->
          <span *ngIf="column.sorting" class="flex flex-col gap-[1.5px] items-center shrink-0 ml-0.5">
            <svg
              class="w-2 h-2 transition-colors"
              [class.text-slate-900]="sortDirection === 'asc'"
              [class.text-slate-300]="sortDirection !== 'asc'"
              viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 0.5L9.5 5.5H0.5L5 0.5Z" />
            </svg>
            <svg
              class="w-2 h-2 transition-colors"
              [class.text-slate-900]="sortDirection === 'desc'"
              [class.text-slate-300]="sortDirection !== 'desc'"
              viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 5.5L0.5 0.5H9.5L5 5.5Z" />
            </svg>
          </span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <!-- Column Options Menu Trigger (Pin, Readonly, Hide) -->
          <div class="relative inline-block text-left" (click)="$event.stopPropagation()">
            <button
              type="button"
              (click)="toggleMenu($event)"
              class="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 opacity-0 group-hover/th:opacity-100 transition-opacity cursor-pointer"
              title="Column options: pin, readonly, hide"
            >
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.75"></circle>
                <circle cx="12" cy="12" r="1.75"></circle>
                <circle cx="12" cy="19" r="1.75"></circle>
              </svg>
            </button>

            <!-- Column Options Popover -->
            <div
              *ngIf="isMenuOpen"
              class="absolute right-0 top-full mt-1.5 z-[120] min-w-[100px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg space-y-0.5 text-left normal-case tracking-normal"
            >
              <button
                type="button"
                (click)="onSelectOption('pin', $event)"
                class="flex w-full items-center px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium"
              >
                pin
              </button>
              <button
                type="button"
                (click)="onSelectOption('readonly', $event)"
                class="flex w-full items-center px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium"
              >
                readonly
              </button>
              <button
                type="button"
                (click)="onSelectOption('hide', $event)"
                class="flex w-full items-center px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium"
              >
                hide
              </button>
            </div>
          </div>

          <!-- Info Note Micro-Tooltip -->
          <div *ngIf="column.info_note" class="relative group/info flex items-center shrink-0">
            <button
              type="button"
              class="inline-flex items-center justify-center w-4 h-4 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              (click)="$event.stopPropagation()"
            >
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>

            <div class="pointer-events-none absolute right-0 top-full mt-1.5 z-50 hidden group-hover/info:block whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-normal text-slate-100 shadow-xl border border-slate-800">
              {{ column.info_note }}
              <div class="absolute -top-1 right-2 h-2 w-2 rotate-45 bg-slate-900 border-t border-l border-slate-800"></div>
            </div>
          </div>
        </div>
      </div>
    </th>
  `,
})
export class HeaderComponent {
  @Input({ required: true }) column!: EnrichedColumn;
  @Input() sortDirection: 'asc' | 'desc' | null = null;
  @Output() sortChange = new EventEmitter<EnrichedColumn>();
  @Output() columnOption = new EventEmitter<{ colKey: string; option: 'pin' | 'readonly' | 'hide' }>();

  isMenuOpen = false;

  onSort(): void {
    if (this.column.sorting) {
      this.sortChange.emit(this.column);
    }
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSelectOption(option: 'pin' | 'readonly' | 'hide', e: MouseEvent): void {
    e.stopPropagation();
    this.isMenuOpen = false;
    this.columnOption.emit({ colKey: this.column.key, option });
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.isMenuOpen = false;
  }
}

