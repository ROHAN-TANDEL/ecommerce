import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ButtonGroupOption {
  label: string;
  value: any;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'nexora-button-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex rounded-lg shadow-xs border border-[#D0D5DD] bg-white p-0.5" role="group">
      <button
        *ngFor="let opt of options; let first = first; let last = last"
        type="button"
        [disabled]="opt.disabled || disabled"
        (click)="select(opt.value)"
        class="h-8 px-3 text-xs font-medium transition-all select-none cursor-pointer flex items-center gap-1.5 rounded-md disabled:cursor-not-allowed disabled:opacity-40"
        [class.bg-[#436CF3]]="opt.value === value"
        [class.text-white]="opt.value === value"
        [class.shadow-xs]="opt.value === value"
        [class.text-[#344054]]="opt.value !== value"
        [class.hover:bg-[#F9FAFB]]="opt.value !== value"
      >
        <span *ngIf="opt.icon">{{ opt.icon }}</span>
        <span>{{ opt.label }}</span>
        <span
          *ngIf="opt.badge"
          class="text-[10px] px-1 py-0.2 rounded-full"
          [class.bg-white/20]="opt.value === value"
          [class.bg-[#F2F4F7]]="opt.value !== value"
        >
          {{ opt.badge }}
        </span>
      </button>
    </div>
  `
})
export class NexoraButtonGroupComponent {
  @Input() options: ButtonGroupOption[] = [];
  @Input() value: any = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<any>();

  select(val: any): void {
    if (this.disabled) return;
    this.value = val;
    this.valueChange.emit(this.value);
  }
}

@Component({
  selector: 'nexora-toggle-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled"
      (click)="toggle()"
      class="h-9 px-3.5 rounded-lg border text-xs font-medium inline-flex items-center gap-2 transition-all cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-40"
      [class.bg-[#EFF4FF]]="pressed"
      [class.border-[#436CF3]]="pressed"
      [class.text-[#436CF3]]="pressed"
      [class.bg-white]="!pressed"
      [class.border-[#D0D5DD]]="!pressed"
      [class.text-[#344054]]="!pressed"
      [class.hover:bg-[#F9FAFB]]="!pressed"
    >
      <span *ngIf="icon">{{ icon }}</span>
      <span>{{ label }}</span>
    </button>
  `
})
export class NexoraToggleButtonComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() pressed = false;
  @Input() disabled = false;

  @Output() pressedChange = new EventEmitter<boolean>();

  toggle(): void {
    if (this.disabled) return;
    this.pressed = !this.pressed;
    this.pressedChange.emit(this.pressed);
  }
}
