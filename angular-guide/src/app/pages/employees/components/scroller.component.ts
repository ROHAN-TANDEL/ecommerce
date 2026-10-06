import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'scroller-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2.5 px-2 py-0.5 select-none">
      <span class="text-xs font-bold text-slate-400 tracking-wider uppercase">COLUMNS</span>
      <button
        type="button"
        (click)="onScrollLeft()"
        class="w-8 h-8 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer active:scale-95"
        title="Scroll Left"
      >
        <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span class="text-sm font-bold text-slate-700 min-w-[38px] text-center font-sans tracking-tight">
        {{ percentage }}%
      </span>

      <button
        type="button"
        (click)="onScrollRight()"
        class="w-8 h-8 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer active:scale-95"
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
  @Output() scroll = new EventEmitter<'left' | 'right'>();

  onScrollLeft(): void {
    this.scroll.emit('left');
  }

  onScrollRight(): void {
    this.scroll.emit('right');
  }
}
