import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'refresh-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-flex">
      <button
        type="button"
        [disabled]="disabled || refreshing"
        (click)="onClick($event)"
        class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:bg-slate-100 active:scale-[0.99] transition-all select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        [title]="infoNote || label"
      >
        <svg
          class="w-3.5 h-3.5 text-slate-500"
          [class.animate-spin]="refreshing"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{{ label }}</span>
      </button>

      <!-- Hover Tooltip -->
      <div
        *ngIf="infoNote"
        class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[120] whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white shadow-md"
      >
        {{ infoNote }}
      </div>
    </div>
  `,
})
export class RefreshComponent {
  @Input() label = 'Refresh';
  @Input() infoNote?: string;
  @Input() disabled = false;
  @Input() refreshing = false;
  @Output() refresh = new EventEmitter<void>();

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) {
      this.refresh.emit();
    }
  }
}
