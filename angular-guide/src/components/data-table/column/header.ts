import {
  Component, Input, Output, EventEmitter,
  HostListener, OnInit, OnDestroy, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'dt-column-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule],
  template: `
    <th
      class="relative select-none px-3 py-2.5 align-middle text-left text-[11px] font-semibold
             text-[#0A173D] transition-colors"
      [style.width.px]="currentWidthPx"
      [style.minWidth]="minWidth"
      [style.maxWidth]="maxWidth"
      [class.bg-slate-50]="!frozen"
      [class.bg-[#EEF2FF]]="frozen"
      [class.border-r-2]="frozen"
      [class.border-r-[#436CF3]/30]="frozen"
      [class.sticky]="frozen"
      [class.left-0]="frozen"
      [class.z-10]="frozen"
    >
      <div class="flex items-center gap-1.5" [class.pr-3]="resizable" [class.pr-2]="!resizable">

        <button *ngIf="sortable" type="button"
          class="group/sort flex min-w-0 items-center gap-1.5 text-left"
          (click)="cycleSort()"
          [attr.aria-label]="'Sort by ' + label"
          [attr.aria-sort]="sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none'">
          <span class="truncate">{{ label }}</span>
          <span class="flex flex-col gap-[1px] opacity-40 group-hover/sort:opacity-100 transition-opacity"
            [class.opacity-100]="sortDirection !== null">
            <span class="leading-none text-[8px]"
              [class.text-[#436CF3]]="sortDirection === 'asc'"
              [class.text-slate-400]="sortDirection !== 'asc'">▲</span>
            <span class="leading-none text-[8px]"
              [class.text-[#436CF3]]="sortDirection === 'desc'"
              [class.text-slate-400]="sortDirection !== 'desc'">▼</span>
          </span>
        </button>

        <span *ngIf="!sortable" class="truncate">{{ label }}</span>

        <span *ngIf="required" class="shrink-0 text-red-400" title="Required">*</span>

        <!-- Info note tooltip -->
        <span *ngIf="infoNote"
          class="shrink-0 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full
                 border border-slate-300 text-[8px] text-slate-400 cursor-default"
          [title]="infoNote">ℹ</span>

        <span *ngIf="filterable && filterActive"
          class="shrink-0 inline-flex h-4 w-4 items-center justify-center
                 rounded-full bg-[#436CF3] text-[8px] text-white"
          title="Filter active">⌕</span>

        <svg *ngIf="editable === true" class="shrink-0 h-3 w-3 text-[#436CF3]/60"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" title="Editable column">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>

        <svg *ngIf="editable === false" class="shrink-0 h-3 w-3 text-slate-300"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" title="Read-only column">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>

        <span *ngIf="frozen" class="shrink-0 text-[9px] text-[#436CF3]/60" title="Frozen">📌</span>

      </div>

      <!-- Resize handle — fully functional drag-to-resize -->
      <div *ngIf="resizable"
        class="absolute right-0 top-0 h-full w-2 cursor-col-resize transition-colors z-10"
        [class.bg-[#436CF3]/25]="isResizing"
        [class.hover:bg-[#436CF3]/15]="!isResizing"
        (mousedown)="startResize($event)"
        aria-hidden="true">
      </div>
    </th>
  `,
})
export class ColumnHeader implements OnInit, OnDestroy {
  @Input() label: string = '';
  @Input() width: string = '160px';
  @Input() minWidth: string = '80px';
  @Input() maxWidth: string = '400px';
  @Input() sortable: boolean = false;
  @Input() filterable: boolean = false;
  @Input() filterActive: boolean = false;
  @Input() editable: boolean | null = null;
  @Input() resizable: boolean = false;
  @Input() frozen: boolean = false;
  @Input() required: boolean = false;
  @Input() infoNote: string = '';
  @Input() sortDirection: SortDirection = null;

  @Output() sortChange = new EventEmitter<SortDirection>();
  @Output() widthChange = new EventEmitter<number>();

  currentWidthPx: number = 160;
  isResizing = false;

  private startX = 0;
  private startW = 0;

  ngOnInit(): void {
    this.currentWidthPx = parseInt(this.width, 10) || 160;
  }

  ngOnDestroy(): void { this.isResizing = false; }

  cycleSort(): void {
    const next: SortDirection =
      this.sortDirection === null ? 'asc' : this.sortDirection === 'asc' ? 'desc' : null;
    this.sortChange.emit(next);
  }

  startResize(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isResizing = true;
    this.startX = e.clientX;
    this.startW = this.currentWidthPx;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.isResizing) return;
    const min = parseInt(this.minWidth, 10) || 80;
    const max = parseInt(this.maxWidth, 10) || 400;
    this.currentWidthPx = Math.max(min, Math.min(max, this.startW + e.clientX - this.startX));
    this.widthChange.emit(this.currentWidthPx);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void { this.isResizing = false; }
}
