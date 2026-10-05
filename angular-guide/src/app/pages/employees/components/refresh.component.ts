import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'refresh-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled || refreshing"
      (click)="onClick($event)"
      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
      [title]="label"
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
  `,
})
export class RefreshComponent {
  @Input() label = 'Refresh';
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
