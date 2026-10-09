import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scroller-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-3 px-1 py-0.5 select-none">
      <button
        type="button"
        (click)="onScrollLeft()"
        [disabled]="!isScrollable || percentage === 0"
        [class.opacity-30]="!isScrollable || percentage === 0"
        [class.cursor-not-allowed]="!isScrollable || percentage === 0"
        class="w-8 h-8 rounded-lg border border-slate-200/90 bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer active:scale-95 disabled:active:scale-100"
        title="Scroll Left"
      >
        <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span class="text-xs font-medium text-slate-700 min-w-[36px] text-center font-mono tracking-tight whitespace-nowrap">
        {{ displayText }}
      </span>

      <button
        type="button"
        (click)="onScrollRight()"
        [disabled]="!isScrollable || percentage >= 100"
        [class.opacity-30]="!isScrollable || percentage >= 100"
        [class.cursor-not-allowed]="!isScrollable || percentage >= 100"
        class="w-8 h-8 rounded-lg border border-slate-200/90 bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer active:scale-95 disabled:active:scale-100"
        title="Scroll Right"
      >
        <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  `,
})
export class ScrollerComponent {
  @Input() percentage = 0;
  @Input() totalColumns = 12;
  @Input() isScrollable = false;
  @Output() scroll = new EventEmitter<'left' | 'right'>();

  get displayText(): string {
    if (!this.isScrollable) {
      return `${this.totalColumns} column${this.totalColumns === 1 ? '' : 's'}`;
    }
    return `${this.percentage}%`;
  }

  onScrollLeft(): void {
    if (this.isScrollable && this.percentage > 0) {
      this.scroll.emit('left');
    }
  }

  onScrollRight(): void {
    if (this.isScrollable && this.percentage < 100) {
      this.scroll.emit('right');
    }
  }
}

