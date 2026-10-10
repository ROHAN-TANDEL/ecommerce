import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RadioOption {
  label: string;
  value: any;
  description?: string;
  disabled?: boolean;
}

@Component({
  selector: 'nexora-radio-group-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      <div class="flex items-center justify-between">
        <label *ngIf="label" class="text-xs font-semibold text-[#344054]">
          {{ label }}
          <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
        </label>
        <span *ngIf="badge" class="text-[10px] font-medium text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">
          {{ badge }}
        </span>
      </div>

      <div [class]="direction === 'row' ? 'flex flex-wrap items-center gap-4' : 'flex flex-col gap-2'">
        <label
          *ngFor="let opt of options; let i = index"
          class="flex items-start gap-2.5 cursor-pointer select-none group"
          [class.opacity-40]="opt.disabled || disabled"
          [class.cursor-not-allowed]="opt.disabled || disabled"
        >
          <div class="relative flex items-center justify-center mt-0.5">
            <input
              type="radio"
              [name]="name"
              [value]="opt.value"
              [checked]="opt.value === value"
              [disabled]="opt.disabled || disabled"
              (change)="onSelect(opt.value)"
              class="peer sr-only"
            />
            <div class="w-4 h-4 rounded-full border border-[#D0D5DD] bg-white peer-checked:border-[#436CF3] peer-checked:bg-[#436CF3] transition-all flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
          </div>

          <div class="flex flex-col">
            <span class="text-xs font-medium text-[#1D2939] group-hover:text-[#436CF3] transition-colors">
              {{ opt.label }}
            </span>
            <span *ngIf="opt.description" class="text-[10px] text-[#667085]">
              {{ opt.description }}
            </span>
          </div>
        </label>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraRadioGroupInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() name = 'radio-group-' + Math.random().toString(36).substring(7);
  @Input() direction: 'row' | 'col' = 'col';
  @Input() options: RadioOption[] = [];
  @Input() value: any = null;

  @Output() valueChange = new EventEmitter<any>();

  onSelect(val: any) {
    if (this.disabled) return;
    this.value = val;
    this.valueChange.emit(this.value);
  }
}
