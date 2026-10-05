import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SegmentedOption {
  label: string;
  value: any;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'nexora-segmented',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex p-1 bg-[#F2F4F7] rounded-lg gap-1 border border-[#EAECF0]" role="tablist">
      <button
        *ngFor="let opt of options"
        type="button"
        [disabled]="opt.disabled || disabled"
        (click)="select(opt.value)"
        class="h-7 px-3 rounded-md text-xs font-semibold transition-all select-none cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        [class.bg-white]="opt.value === value"
        [class.text-[#101828]]="opt.value === value"
        [class.shadow-xs]="opt.value === value"
        [class.text-[#667085]]="opt.value !== value"
        [class.hover:text-[#344054]]="opt.value !== value"
      >
        <span *ngIf="opt.icon" class="text-xs">{{ opt.icon }}</span>
        <span>{{ opt.label }}</span>
        <span
          *ngIf="opt.badge"
          class="text-[9px] font-bold px-1 py-0.2 rounded-full"
          [class.bg-[#EFF4FF]]="opt.value === value"
          [class.text-[#436CF3]]="opt.value === value"
          [class.bg-[#E4E7EC]]="opt.value !== value"
          [class.text-[#475467]]="opt.value !== value"
        >
          {{ opt.badge }}
        </span>
      </button>
    </div>
  `
})
export class NexoraSegmentedComponent {
  @Input() options: SegmentedOption[] = [];
  @Input() value: any = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<any>();

  select(val: any): void {
    if (this.disabled) return;
    this.value = val;
    this.valueChange.emit(this.value);
  }
}
