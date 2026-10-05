import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'button-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [ngClass]="buttonClasses"
      class="inline-flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs rounded-lg"
    >
      <span *ngIf="loading" class="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): Record<string, boolean> {
    return {
      // Primary (Black / Slate)
      'bg-slate-900 text-white shadow-xs hover:bg-slate-800 active:scale-98 border border-transparent': this.variant === 'primary',
      // Secondary / Outline (White / Slate)
      'bg-white text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 hover:border-slate-300': this.variant === 'secondary' || this.variant === 'outline',
      // Ghost
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent': this.variant === 'ghost',
      // Danger
      'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100': this.variant === 'danger',
      // Sizes
      'px-2.5 py-1 text-[11px]': this.size === 'sm',
      'px-3.5 py-2 text-xs': this.size === 'md',
      'px-4 py-2.5 text-sm': this.size === 'lg',
    };
  }

  onClick(e: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(e);
    }
  }
}
