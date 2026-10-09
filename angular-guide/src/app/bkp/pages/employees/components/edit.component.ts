import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'edit-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group inline-flex">
      <button
        type="button"
        [disabled]="disabled"
        (click)="onClick($event)"
        [ngClass]="{
          'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs active:scale-[0.99] cursor-pointer': editing && !disabled,
          'bg-white text-slate-700 border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:bg-slate-100 active:scale-[0.99] cursor-pointer': !editing && !disabled,
          'bg-slate-50 text-slate-400 border-slate-200 opacity-40 shadow-none cursor-not-allowed': disabled
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all select-none"
        [title]="infoNote || label"
      >
        <svg class="w-3.5 h-3.5" [class.text-white]="editing && !disabled" [class.text-slate-500]="!editing && !disabled" [class.text-slate-400]="disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
export class EditComponent {
  @Input() label = 'Edit';
  @Input() infoNote?: string;
  @Input() disabled = false;
  @Input() editing = false;
  @Output() edit = new EventEmitter<void>();
  @Output() editToggle = new EventEmitter<boolean>();

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) {
      this.edit.emit();
    }
  }
}
