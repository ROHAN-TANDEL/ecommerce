import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ActionButtonVariant = 'default' | 'primary' | 'danger' | 'success' | 'amber';

@Component({
  selector: 'dt-action-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: inline-block; }'],
  template: `
    <button type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium shadow-sm transition-colors
             disabled:cursor-not-allowed disabled:opacity-40"
      [ngClass]="variantClasses"
      [disabled]="disabled"
      [title]="tooltip || label"
      (click)="!disabled && clicked.emit()">
      <span *ngIf="icon" class="text-[13px]">{{ icon }}</span>
      <span>{{ label }}</span>
      <span *ngIf="badge != null"
            class="ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold"
            [ngClass]="badgeClasses">
        {{ badge }}
      </span>
    </button>
  `
})
export class ActionButtonComponent {
  @Input() icon?: string;
  @Input() label: string = 'Action';
  @Input() variant: ActionButtonVariant = 'default';
  @Input() disabled = false;
  @Input() badge?: string | number;
  @Input() tooltip?: string;
  @Output() clicked = new EventEmitter<void>();

  get variantClasses(): Record<string, boolean> {
    return {
      'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50':
        this.variant === 'default',
      'border-[#436CF3] bg-[#436CF3] text-white hover:bg-[#3557d4]':
        this.variant === 'primary',
      'border-red-200 bg-red-50 text-red-700 hover:bg-red-100':
        this.variant === 'danger',
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100':
        this.variant === 'success',
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100':
        this.variant === 'amber',
    };
  }

  get badgeClasses(): Record<string, boolean> {
    return {
      'bg-slate-100 text-slate-600': this.variant === 'default',
      'bg-blue-400 text-white': this.variant === 'primary',
      'bg-red-200 text-red-800': this.variant === 'danger',
      'bg-emerald-200 text-emerald-800': this.variant === 'success',
      'bg-amber-200 text-amber-800': this.variant === 'amber',
    };
  }
}
