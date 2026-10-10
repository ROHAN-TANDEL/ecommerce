import { Component, Input, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrichedColumn, ColumnOptionsConfigPayload } from '../employees.types';

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
      [class.z-[70]]="isMenuOpen"
      [class.z-20]="column.isFrozen && !isMenuOpen"
      [class.border-r]="column.isFrozen"
      [class.border-slate-200]="column.isFrozen"
      [class.bg-slate-50]="column.isFrozen"
      class="px-3.5 py-3 select-none transition-colors border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-700 tracking-normal relative group/th hover:z-[65]"
    >
      <div class="flex items-center justify-between gap-1.5" [class.flex-row-reverse]="isNumericColumn">
        <div
          class="flex items-center gap-1.5 min-w-0 truncate cursor-pointer group"
          [class.justify-end]="isNumericColumn"
          (click)="onSort()"
          [title]="'Sort by ' + column.header_name"
        >
          <span *ngIf="!column.icon_only" class="truncate font-semibold text-slate-700" [title]="column.header_name">{{ column.header_name }}</span>
          <span *ngIf="column.icon_only" class="inline-flex items-center justify-center text-slate-600" [title]="column.header_name">
            <svg *ngIf="column.key === 'id'" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
            <svg *ngIf="column.key === 'status'" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /></svg>
            <svg *ngIf="column.key === 'first_name' || column.key === 'last_name' || column.key === 'name'" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <svg *ngIf="column.key === 'email' || column.key === 'user_email'" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <svg *ngIf="column.key === 'created_at' || column.key === 'date' || column.key === 'user_created_at'" class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span *ngIf="column.key !== 'id' && column.key !== 'status' && column.key !== 'first_name' && column.key !== 'last_name' && column.key !== 'name' && column.key !== 'email' && column.key !== 'user_email' && column.key !== 'created_at' && column.key !== 'date' && column.key !== 'user_created_at'" class="text-[11px] font-bold text-slate-500 uppercase">{{ column.header_name.slice(0, 3) }}</span>
          </span>

          <!-- Paired Chevron Sort SVG Indicator -->
          <span *ngIf="column.sorting" class="flex flex-col gap-[1px] items-center shrink-0 ml-0.5">
            <svg
              class="w-2.5 h-2 transition-colors"
              [class.text-[#436CF3]]="sortDirection === 'asc'"
              [class.text-slate-300]="sortDirection !== 'asc'"
              viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 0.5L9.5 5.5H0.5L5 0.5Z" />
            </svg>
            <svg
              class="w-2.5 h-2 transition-colors"
              [class.text-[#436CF3]]="sortDirection === 'desc'"
              [class.text-slate-300]="sortDirection !== 'desc'"
              viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 5.5L0.5 0.5H9.5L5 5.5Z" />
            </svg>
          </span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <!-- Pinned Option: Pin to left / freeze -->
          <button
            *ngIf="columnOptionsConfig?.pin?.pinned"
            type="button"
            (click)="onSelectOption('pin', $event)"
            class="w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer"
            [ngClass]="column.isFrozen ? 'text-amber-700 bg-amber-100 font-bold border border-amber-300' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'"
            [title]="column.isFrozen ? 'Unpin column' : 'Pin column to left'"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 12V4h1V2H7v2h1v8l-2 4v2h5v4l1 1 1-1v-4h5v-2l-2-4z" />
            </svg>
          </button>

          <!-- Pinned Option: Readonly -->
          <button
            *ngIf="columnOptionsConfig?.readonly?.pinned"
            type="button"
            (click)="onSelectOption('readonly', $event)"
            class="w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer"
            [ngClass]="!column.editable ? 'text-rose-700 bg-rose-100 font-bold border border-rose-300' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'"
            [title]="!column.editable ? 'Readonly: click to make editable' : 'Editable: click to make readonly'"
          >
            <svg *ngIf="!column.editable" class="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <svg *ngIf="column.editable" class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>

          <!-- Pinned Option: Hide -->
          <button
            *ngIf="columnOptionsConfig?.hide?.pinned"
            type="button"
            (click)="onSelectOption('hide', $event)"
            class="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Hide column"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
          </button>

          <!-- Column Options Menu Trigger (Pin, Readonly, Hide) -->
          <div *ngIf="hasUnpinnedOptions" class="relative inline-block text-left" (click)="$event.stopPropagation()">
            <button
              type="button"
              (click)="toggleMenu($event)"
              class="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 opacity-0 group-hover/th:opacity-100 transition-opacity cursor-pointer"
              [class.!opacity-100]="isMenuOpen"
              title="Column options"
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
              class="absolute right-0 top-full mt-1.5 z-[120] min-w-[110px] rounded-lg border border-slate-200 bg-white p-1 shadow-xl space-y-0.5 text-left normal-case tracking-normal"
            >
              <button
                *ngIf="!columnOptionsConfig?.pin?.pinned"
                type="button"
                (click)="onSelectOption('pin', $event)"
                class="flex w-full items-center px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium"
              >
                {{ column.isFrozen ? 'unpin' : 'pin' }}
              </button>
              <button
                *ngIf="!columnOptionsConfig?.readonly?.pinned"
                type="button"
                (click)="onSelectOption('readonly', $event)"
                class="flex w-full items-center px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium"
              >
                readonly
              </button>
              <button
                *ngIf="!columnOptionsConfig?.hide?.pinned"
                type="button"
                (click)="onSelectOption('hide', $event)"
                class="flex w-full items-center px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium"
              >
                hide
              </button>
            </div>
          </div>

          <!-- Info Note Micro-Tooltip (Floats below header on bottom side, suppressed when column menu is open) -->
          <div *ngIf="column.info_note && !isMenuOpen" class="relative group/info flex items-center shrink-0">
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

            <div class="pointer-events-none absolute right-0 top-full mt-2 z-[100] hidden group-hover/info:block whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-normal text-slate-100 shadow-xl border border-slate-800 text-left">
              {{ column.info_note }}
              <div class="absolute -top-1 right-2 h-2 w-2 rotate-45 bg-slate-900 border-t border-l border-slate-800"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Column Drag Resize Handle -->
      <div
        *ngIf="isResizable"
        class="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-30 group-hover/th:bg-slate-300 hover:!bg-blue-500 transition-colors select-none"
        [class.!bg-blue-500]="isResizing"
        [class.w-2]="isResizing"
        (mousedown)="onResizeStart($event)"
        (touchstart)="onTouchStart($event)"
        (click)="$event.stopPropagation()"
        title="Drag to resize column"
        aria-hidden="true"
      ></div>
    </th>
  `,
})
export class HeaderComponent implements OnDestroy {
  @Input({ required: true }) column!: EnrichedColumn;
  @Input() sortDirection: 'asc' | 'desc' | null = null;
  @Input() columnOptionsConfig?: ColumnOptionsConfigPayload;
  @Output() sortChange = new EventEmitter<EnrichedColumn>();
  @Output() columnOption = new EventEmitter<{ colKey: string; option: 'pin' | 'readonly' | 'hide' }>();
  @Output() columnResize = new EventEmitter<{ colKey: string; width: string }>();

  isMenuOpen = false;
  isResizing = false;
  menuId = 'header-col-menu-' + Math.random().toString(36).substring(2, 9);
  private startX = 0;
  private startW = 180;

  get hasUnpinnedOptions(): boolean {
    if (!this.columnOptionsConfig) return true;
    return !this.columnOptionsConfig.pin?.pinned || !this.columnOptionsConfig.readonly?.pinned || !this.columnOptionsConfig.hide?.pinned;
  }

  get isNumericColumn(): boolean {
    return this.column?.filter_type === 'single_number' || this.column?.filter_type === 'number_range';
  }

  get isResizable(): boolean {
    return this.column?.column_resize === true || String(this.column?.column_resize).toLowerCase() === 'true';
  }

  onSort(): void {
    if (this.column.sorting) {
      this.sortChange.emit(this.column);
    }
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.dispatchEvent(new CustomEvent('nexora:menu-open', { detail: this.menuId }));
    }
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

  @HostListener('document:nexora:menu-open', ['$event'])
  onOtherMenuOpen(e: Event): void {
    const customEvent = e as CustomEvent;
    if (customEvent.detail !== this.menuId) {
      this.isMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMenuOpen = false;
  }

  onResizeStart(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isResizing = true;
    this.startX = e.clientX;
    const currentPx = parseInt((this.column.computedWidth || this.column.width || '180').toString().replace('px', ''), 10) || 180;
    this.startW = currentPx;
    try {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } catch {}
  }

  onTouchStart(e: TouchEvent): void {
    if (e.touches && e.touches.length > 0) {
      e.stopPropagation();
      this.isResizing = true;
      this.startX = e.touches[0].clientX;
      const currentPx = parseInt((this.column.computedWidth || this.column.width || '180').toString().replace('px', ''), 10) || 180;
      this.startW = currentPx;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.isResizing) return;
    const minWidth = 70;
    const maxWidth = 800;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, this.startW + (e.clientX - this.startX)));
    const widthStr = `${newWidth}px`;
    this.column.computedWidth = widthStr;
    this.columnResize.emit({ colKey: this.column.key, width: widthStr });
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(e: TouchEvent): void {
    if (!this.isResizing || !e.touches || e.touches.length === 0) return;
    const minWidth = 70;
    const maxWidth = 800;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, this.startW + (e.touches[0].clientX - this.startX)));
    const widthStr = `${newWidth}px`;
    this.column.computedWidth = widthStr;
    this.columnResize.emit({ colKey: this.column.key, width: widthStr });
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isResizing) {
      this.isResizing = false;
      try {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      } catch {}
    }
  }

  @HostListener('document:touchend')
  onTouchEnd(): void {
    if (this.isResizing) {
      this.isResizing = false;
    }
  }

  ngOnDestroy(): void {
    if (this.isResizing) {
      try {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      } catch {}
    }
  }
}

