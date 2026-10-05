import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lock-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled"
      (click)="onClick($event)"
      [ngClass]="{
        'bg-slate-900 text-white border-slate-900': locked,
        'bg-white text-slate-700 border-slate-200 hover:bg-slate-50': !locked
      }"
      class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
      [title]="label"
    >
      <svg class="w-3.5 h-3.5" [class.text-white]="locked" [class.text-slate-500]="!locked" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke-linecap="round" stroke-linejoin="round" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0v4" />
      </svg>
      <span>{{ label }}</span>
    </button>
  `,
})
export class LockComponent {
  @Input() label = 'Lock';
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
