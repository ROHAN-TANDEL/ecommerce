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
      [title]="title || label || ''"
      class="inline-flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs rounded-lg"
    >
      <span *ngIf="loading" class="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
      <span *ngIf="label">{{ label }}</span>
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() label?: string;
  @Input() title?: string;
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' = 'secondary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() clicked = new EventEmitter<MouseEvent>();
  @Output() btnClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): Record<string, boolean> {
    return {
      // Primary (Nexora Brand Blue)
      'bg-[#436CF3] text-white shadow-2xs hover:bg-[#365BD4] active:scale-[0.99] border border-transparent font-medium': this.variant === 'primary',
      // Secondary / Outline (Subtle Neutral White/Slate)
      'bg-white text-slate-700 border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100': this.variant === 'secondary' || this.variant === 'outline',
      // Ghost
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent': this.variant === 'ghost',
      // Danger (Restrained Semantic Red)
      'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300': this.variant === 'danger',
      // Standardized Heights & Padding
      'h-7 px-2.5 text-[11px]': this.size === 'sm',
      'h-8 px-3 text-xs': this.size === 'md',
      'h-9.5 px-4 text-sm': this.size === 'lg',
    };
  }

  onClick(e: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(e);
      this.btnClick.emit(e);
    }
  }
}
