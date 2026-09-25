import {
  Component, Input, Output, EventEmitter,
  ElementRef, HostListener, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Resizable — Column <th> with drag-to-resize affordance.
 *
 * COLUMN level · Property: resizable=true, width, minWidth, maxWidth
 *
 * Rules:
 *   • Exposes a resize handle on the right edge.
 *   • Cannot exceed maxWidth or shrink below minWidth.
 *   • Resize handle must not overlap the header label.
 * Constraints:
 *   • A non-resizable column must not display a resize affordance.
 *
 * Usage: mousedown on the handle → tracks mousemove → emits widthChange.
 * The parent must bind [style.width] to the emitted px value.
 */
@Component({
  selector: 'dt-col-resizable',
  standalone: true,
  imports: [CommonModule],
  template: `
    <th
      class="relative select-none bg-slate-50 px-3 py-3 text-left
             text-[11px] font-semibold text-[#0A173D]"
      [style.width.px]="currentWidth"
      [style.minWidth]="minWidth"
      [style.maxWidth]="maxWidth"
    >
      <div class="flex items-center gap-1.5 pr-3">
        <span class="truncate">{{ label }}</span>
        <span *ngIf="isResizing"
          class="shrink-0 text-[9px] text-[#436CF3]" aria-hidden="true"
        >↔</span>
      </div>

      <div
        class="absolute right-0 top-0 h-full w-2 cursor-col-resize transition-colors"
        [class.bg-[#436CF3]/20]="isResizing"
        (mousedown)="startResize($event)"
        title="Drag to resize column"
        aria-hidden="true"
      ></div>
    </th>
  `,
})
export class ResizableColumns implements OnInit, OnDestroy {
  @Input() label: string = '';
  @Input() initialWidth: number = 160;
  @Input() minWidth: string = '80px';
  @Input() maxWidth: string = '600px';

  @Output() widthChange = new EventEmitter<number>();

  currentWidth: number = 160;
  isResizing: boolean = false;

  private startX: number = 0;
  private startWidth: number = 0;
  private readonly minPx = 80;
  private readonly maxPx = 600;

  ngOnInit(): void { this.currentWidth = this.initialWidth; }

  startResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.currentWidth;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    const next = Math.min(this.maxPx, Math.max(this.minPx, this.startWidth + (event.clientX - this.startX)));
    this.currentWidth = next;
    this.widthChange.emit(next);
  }

  @HostListener('document:mouseup')
  onMouseUp(): void { this.isResizing = false; }

  ngOnDestroy(): void { this.isResizing = false; }
}
