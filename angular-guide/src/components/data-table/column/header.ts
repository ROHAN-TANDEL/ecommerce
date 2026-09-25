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
      class="relative select-none px-3 align-middle text-center text-[11px]
             font-semibold text-[#0A173D] transition-colors"
      [class.py-1.5]="density === 'compact'"
      [class.py-2.5]="density === 'comfortable'"
      [class.py-4]="density === 'spacious'"
      [style.width.px]="currentWidthPx"
      [style.minWidth]="minWidth"
      [style.maxWidth]="maxWidth"
      [class.bg-slate-50]="!frozen"
      [class.bg-[#EEF2FF]]="frozen"
      [class.border-r]="frozen"
      [class.border-r-[#436CF3]/30]="frozen"
      [class.sticky]="frozen"
      [class.z-20]="frozen"
      [style.left]="frozen && frozenSide === 'left' ? frozenOffset : null"
      [style.right]="frozen && frozenSide === 'right' ? frozenOffset : null"
    >
      <div class="flex items-center justify-center gap-1"
           [class.pr-2]="resizable">

        <!-- Sortable label -->
        <button *ngIf="sortable" type="button"
          class="group/sort flex min-w-0 items-center justify-center gap-1 text-center"
          (click)="cycleSort()"
          [attr.aria-label]="'Sort by ' + label"
          [attr.aria-sort]="sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none'">
          <span class="truncate" [title]="label">{{ label }}</span>
          <span class="flex shrink-0 flex-col gap-[1px] opacity-50
                       group-hover/sort:opacity-100 transition-opacity"
            [class.opacity-100]="sortDirection !== null">
            <span class="leading-none text-[8px]"
              [class.text-[#436CF3]]="sortDirection === 'asc'"
              [class.text-slate-400]="sortDirection !== 'asc'">▲</span>
            <span class="leading-none text-[8px]"
              [class.text-[#436CF3]]="sortDirection === 'desc'"
              [class.text-slate-400]="sortDirection !== 'desc'">▼</span>
          </span>
        </button>

        <!-- Non-sortable label -->
        <span *ngIf="!sortable" class="truncate" [title]="label">{{ label }}</span>

        <!-- Info note — only when present -->
        <span *ngIf="infoNote"
          class="shrink-0 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full
                 border border-slate-300 text-[8px] text-slate-400 cursor-default hover:border-slate-500"
          [title]="infoNote">ℹ</span>

        <!-- Filter active -->
        <span *ngIf="filterable && filterActive"
          class="shrink-0 inline-flex h-4 w-4 items-center justify-center
                 rounded-full bg-[#436CF3] text-[8px] text-white"
          title="Filter active">⌕</span>

        <!-- Required -->
        <span *ngIf="required" class="shrink-0 text-red-400" title="Required">*</span>

        <!-- Editable / read-only column indicators -->
        <svg *ngIf="editable === true" class="shrink-0 h-3 w-3 text-[#436CF3]/60"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" title="Editable column">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <svg *ngIf="editable === false" class="shrink-0 h-3 w-3 text-slate-400"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" title="Read-only column">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>

        <!-- Frozen indicator -->
        <span *ngIf="frozen" class="shrink-0 text-[9px] text-[#436CF3]/70" title="Frozen column">📌</span>

      </div>
      
      <!-- Column Options Dropdown -->
      <div class="absolute right-2 top-1/2 -translate-y-1/2 z-10" (click)="$event.stopPropagation()">
        <button type="button"
          class="inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          (click)="showMenu = !showMenu"
          title="Column options">⋮</button>
          
        <div *ngIf="showMenu" class="absolute right-0 top-full mt-1 min-w-[120px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl font-normal text-left z-50 text-slate-700">
          <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] hover:bg-blue-50 hover:text-[#436CF3]"
            (click)="onPinAction('left')">
            <span class="w-3 text-center">{{ frozen && frozenSide === 'left' ? '✓' : '' }}</span> Pin left
          </button>
          <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] hover:bg-blue-50 hover:text-[#436CF3]"
            (click)="onPinAction('right')">
            <span class="w-3 text-center">{{ frozen && frozenSide === 'right' ? '✓' : '' }}</span> Pin right
          </button>
          <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] hover:bg-blue-50 hover:text-[#436CF3]"
            (click)="onPinAction('unpin')">
            <span class="w-3 text-center">{{ !frozen ? '✓' : '' }}</span> Unpin
          </button>
          <div class="my-1 border-t border-slate-100"></div>
          <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-red-600 hover:bg-red-50"
            (click)="onLockUpdate()">
            <span class="w-3 text-center">{{ isLocked ? '🔒' : '🔓' }}</span> 
            <span>{{ isLocked ? 'Unlock update' : 'Lock update (1m)' }}</span>
            <span *ngIf="isLocked" class="ml-auto text-[9px]">{{ countdown }}s</span>
          </button>
        </div>
      </div>

      <!-- Drag-to-resize handle -->
      <div *ngIf="resizable"
        class="absolute right-0 top-0 h-full w-1.5 cursor-col-resize z-10
               hover:bg-[#436CF3]/20 transition-colors"
        [class.bg-[#436CF3]/30]="isResizing"
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
  @Input() frozenSide: 'left' | 'right' = 'left';
  @Input() frozenOffset: string = '0px';
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Input() required: boolean = false;
  @Input() infoNote: string = '';
  @Input() sortDirection: SortDirection = null;

  @Output() sortChange = new EventEmitter<SortDirection>();
  @Output() widthChange = new EventEmitter<number>();
  @Output() pinChange = new EventEmitter<'left' | 'right' | 'unpin'>();

  currentWidthPx: number = 160;
  isResizing = false;
  showMenu = false;
  isLocked = false;
  countdown = 60;
  private intervalId: any;
  private startX = 0;
  private startW = 0;

  ngOnInit(): void { this.currentWidthPx = parseInt(this.width, 10) || 160; }
  
  ngOnDestroy(): void { 
    this.isResizing = false;
    this.clearTimer();
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.showMenu = false; }

  onPinAction(action: 'left' | 'right' | 'unpin') {
    this.pinChange.emit(action);
    this.showMenu = false;
  }
  
  onLockUpdate() {
    this.isLocked = !this.isLocked;
    if (this.isLocked) {
      this.countdown = 60;
      this.clearTimer();
      this.intervalId = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--;
        } else {
          this.isLocked = false;
          this.clearTimer();
        }
      }, 1000);
    } else {
      this.clearTimer();
    }
    // Leave menu open to show countdown, or close it. We'll leave it open.
  }
  
  private clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  cycleSort(): void {
    const n: SortDirection = this.sortDirection === null ? 'asc' : this.sortDirection === 'asc' ? 'desc' : null;
    this.sortChange.emit(n);
  }

  startResize(e: MouseEvent): void {
    e.preventDefault(); e.stopPropagation();
    this.isResizing = true; this.startX = e.clientX; this.startW = this.currentWidthPx;
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
