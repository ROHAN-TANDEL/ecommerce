import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CheckboxOption {
  label: string;
  value: any;
  description?: string;
  disabled?: boolean;
}

@Component({
  selector: 'nexora-checkbox-group-input',
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
          *ngFor="let opt of options"
          class="flex items-start gap-2.5 cursor-pointer select-none group"
          [class.opacity-40]="opt.disabled || disabled"
          [class.cursor-not-allowed]="opt.disabled || disabled"
        >
          <div class="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              [checked]="isChecked(opt.value)"
              [disabled]="opt.disabled || disabled"
              (change)="toggleValue(opt.value)"
              class="peer sr-only"
            />
            <div
              class="w-4 h-4 rounded border border-[#D0D5DD] bg-white transition-all flex items-center justify-center
                     peer-checked:border-[#436CF3] peer-checked:bg-[#436CF3] peer-focus:ring-2 peer-focus:ring-[#EFF4FF]"
            >
              <svg *ngIf="isChecked(opt.value)" class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
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
export class NexoraCheckboxGroupInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() direction: 'row' | 'col' = 'col';
  @Input() options: CheckboxOption[] = [];
  @Input() values: any[] = [];

  @Output() valuesChange = new EventEmitter<any[]>();

  isChecked(val: any): boolean {
    return this.values.includes(val);
  }

  toggleValue(val: any) {
    if (this.disabled) return;
    if (this.isChecked(val)) {
      this.values = this.values.filter(v => v !== val);
    } else {
      this.values = [...this.values, val];
    }
    this.valuesChange.emit(this.values);
  }
}
