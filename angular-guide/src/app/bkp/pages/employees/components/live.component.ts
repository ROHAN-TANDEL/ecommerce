import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'live-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-flex">
      <button
        type="button"
        [disabled]="disabled"
        (click)="onClick($event)"
        [ngClass]="{
          'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100': active,
          'bg-white text-slate-700 border-slate-200 hover:bg-slate-50': !active,
          'w-8 px-0 justify-center': iconOnly,
          'px-3': !iconOnly
        }"
        class="inline-flex h-8 items-center gap-1.5 rounded-lg border text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        [title]="infoNote || (label + ' Feed')"
      >
        <span class="relative flex h-2 w-2">
          <span
            *ngIf="active"
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-2 w-2"
            [ngClass]="active ? 'bg-emerald-500' : 'bg-slate-400'"
          ></span>
        </span>
        <span *ngIf="!iconOnly">{{ label }}</span>
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
export class LiveComponent {
  @Input() label = 'Live';
  @Input() infoNote?: string;
  @Input() disabled = false;
  @Input() active = false;
  @Input() iconOnly = false;
  @Output() liveToggle = new EventEmitter<boolean>();

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) {
      this.active = !this.active;
      this.liveToggle.emit(this.active);
    }
  }
}
