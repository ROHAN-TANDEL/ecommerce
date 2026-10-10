import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text' | 'link' | 'success' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'nexora-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [ngClass]="[
        getBaseClass(),
        getVariantClass(),
        getSizeClass()
      ]"
    >
      <!-- Loading spinner -->
      <svg *ngIf="loading" class="animate-spin -ml-0.5 h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>

      <!-- Leading icon -->
      <span *ngIf="icon && !loading" class="shrink-0 flex items-center justify-center">
        <i *ngIf="isIconClass(icon)" [class]="icon"></i>
        <span *ngIf="!isIconClass(icon)">{{ icon }}</span>
      </span>

      <!-- Label / Content -->
      <span *ngIf="label" [class.opacity-90]="loading">{{ label }}</span>
      <ng-content></ng-content>

      <!-- Trailing icon -->
      <span *ngIf="trailingIcon" class="shrink-0 flex items-center justify-center">
        <i *ngIf="isIconClass(trailingIcon)" [class]="trailingIcon"></i>
        <span *ngIf="!isIconClass(trailingIcon)">{{ trailingIcon }}</span>
      </span>
    </button>
  `
})
export class NexoraButtonComponent {
  @Input() label = '';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() icon = '';
  @Input() trailingIcon = '';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(e: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(e);
    }
  }

  isIconClass(val: string): boolean {
    return val.startsWith('fa') || val.startsWith('lucide') || val.startsWith('icon');
  }

  getBaseClass(): string {
    const full = this.fullWidth ? 'w-full' : '';
    return `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none select-none cursor-pointer disabled:cursor-not-allowed ${full}`;
  }

  getSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'h-7 px-2.5 text-[11px] gap-1.5';
      case 'lg': return 'h-11 px-5 text-sm gap-2.5';
      default: return 'h-9 px-3.5 text-xs gap-2';
    }
  }

  getVariantClass(): string {
    if (this.disabled) {
      return 'bg-[#F2F4F7] text-[#98A2B3] border border-[#EAECF0] shadow-none';
    }

    switch (this.variant) {
      case 'primary':
        return 'bg-[#436CF3] text-white hover:bg-[#3459D9] active:bg-[#2B49B8] shadow-xs focus:ring-2 focus:ring-[#EFF4FF] border border-transparent';
      case 'secondary':
        return 'bg-white text-[#344054] border border-[#D0D5DD] hover:bg-[#F9FAFB] active:bg-[#F2F4F7] shadow-xs focus:ring-2 focus:ring-[#EFF4FF]';
      case 'ghost':
        return 'bg-transparent text-[#475467] hover:bg-[#F2F4F7] active:bg-[#E4E7EC] border border-transparent';
      case 'text':
        return 'bg-transparent text-[#436CF3] hover:text-[#3459D9] active:text-[#2B49B8] p-0 h-auto border-none';
      case 'link':
        return 'bg-transparent text-[#436CF3] hover:underline p-0 h-auto border-none';
      case 'success':
        return 'bg-[#12B76A] text-white hover:bg-[#0E9F5D] active:bg-[#0A854D] shadow-xs focus:ring-2 focus:ring-[#ECFDF3] border border-transparent';
      case 'danger':
        return 'bg-[#F04438] text-white hover:bg-[#D92D20] active:bg-[#B42318] shadow-xs focus:ring-2 focus:ring-[#FEF3F2] border border-transparent';
      default:
        return 'bg-white text-[#344054] border border-[#D0D5DD]';
    }
  }
}
