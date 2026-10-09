import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'save-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-flex">
      <button
        type="button"
        [disabled]="disabled || saving"
        (click)="onClick($event)"
        [ngClass]="{
          'bg-[#436CF3] text-white border-transparent hover:bg-[#365BD4] shadow-2xs active:scale-[0.99] cursor-pointer': !disabled && !saving,
          'bg-slate-50 text-slate-400 border-slate-200 opacity-40 shadow-none cursor-not-allowed': disabled,
          'bg-[#365BD4] text-white border-transparent cursor-wait': saving
        }"
        class="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all select-none"
        [title]="infoNote || label"
      >
        <span *ngIf="saving" class="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
        <svg *ngIf="!saving" class="w-3.5 h-3.5" [class.text-white]="!disabled" [class.text-slate-400]="disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        <span>{{ label }}</span>
        <span *ngIf="!disabled && dirtyCount > 0" class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/25 text-white">
          {{ dirtyCount }}
        </span>
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
export class SaveComponent {
  @Input() label = 'Save';
  @Input() infoNote?: string;
  @Input() disabled = false;
  @Input() saving = false;
  @Input() dirtyCount = 0;
  @Output() save = new EventEmitter<void>();

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled && !this.saving) {
      this.save.emit();
    }
  }
}
