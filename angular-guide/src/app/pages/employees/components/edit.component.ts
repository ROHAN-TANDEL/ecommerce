import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'edit-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled"
      (click)="onClick($event)"
      [ngClass]="{
        'bg-slate-900 text-white border-slate-900': editing,
        'bg-white text-slate-700 border-slate-200 hover:bg-slate-50': !editing
      }"
      class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
      [title]="label"
    >
      <svg class="w-3.5 h-3.5" [class.text-white]="editing" [class.text-slate-500]="!editing" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      <span>{{ label }}</span>
    </button>
  `,
})
export class EditComponent {
  @Input() label = 'Edit';
  @Input() disabled = false;
  @Input() editing = false;
  @Output() editToggle = new EventEmitter<boolean>();

  onClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) {
      this.editing = !this.editing;
      this.editToggle.emit(this.editing);
    }
  }
}
