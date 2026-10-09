import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lock-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-flex">
      <button
        type="button"
        [disabled]="disabled"
        (click)="onClick($event)"
        [ngClass]="{
          'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs active:scale-[0.99]': locked,
          'bg-white text-slate-700 border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:bg-slate-100 active:scale-[0.99]': !locked
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        [title]="infoNote || label"
      >
        <svg class="w-3.5 h-3.5" [class.text-white]="locked" [class.text-slate-500]="!locked" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke-linecap="round" stroke-linejoin="round" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0v4" />
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
export class LockComponent {
  @Input() label = 'Lock';
  @Input() infoNote?: string;
  @Input() disabled = false;
  @Input() locked = false;
  @Output() lockToggle = new EventEmitter<boolean>();

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) {
      this.locked = !this.locked;
      this.lockToggle.emit(this.locked);
    }
  }
}
