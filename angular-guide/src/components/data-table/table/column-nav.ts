import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dt-column-nav',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: inline-block; }'],
  template: `
    <div class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm">
      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400 pl-1">Cols</span>
      <button type="button"
        class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 hover:text-[#436CF3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        [disabled]="!canPrev"
        (click)="navigate.emit('prev')"
        title="Scroll to previous columns">
        ‹
      </button>

      <span class="min-w-[56px] text-center text-[11px] font-medium text-slate-600">
        {{ label }}
      </span>

      <button type="button"
        class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 hover:text-[#436CF3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        [disabled]="!canNext"
        (click)="navigate.emit('next')"
        title="Scroll to next columns">
        ›
      </button>
    </div>
  `
})
export class ColumnNavComponent {
  @Input() label: string = '5 columns';
  @Input() canPrev = true;
  @Input() canNext = true;
  @Output() navigate = new EventEmitter<'prev' | 'next'>();
}
