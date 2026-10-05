import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-number-range-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1 w-full">
      <div class="flex items-center justify-between">
        <label *ngIf="label" class="text-xs font-semibold text-[#344054]">
          {{ label }}
          <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
        </label>
        <span *ngIf="badge" class="text-[10px] font-medium text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">
          {{ badge }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Min input -->
        <div class="relative flex-1">
          <input
            type="number"
            [min]="min"
            [max]="maxVal ?? max"
            [step]="step"
            [disabled]="disabled"
            [(ngModel)]="minVal"
            (ngModelChange)="onMinChange($event)"
            [placeholder]="minPlaceholder"
            class="w-full h-9 px-3 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                   placeholder:text-[#98A2B3] focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                   disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
          />
        </div>

        <span class="text-xs font-semibold text-[#98A2B3] shrink-0">to</span>

        <!-- Max input -->
        <div class="relative flex-1">
          <input
            type="number"
            [min]="minVal ?? min"
            [max]="max"
            [step]="step"
            [disabled]="disabled"
            [(ngModel)]="maxVal"
            (ngModelChange)="onMaxChange($event)"
            [placeholder]="maxPlaceholder"
            class="w-full h-9 px-3 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                   placeholder:text-[#98A2B3] focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                   disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraNumberRangeInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() min = 0;
  @Input() max = 100000;
  @Input() step = 1;
  @Input() minPlaceholder = 'Min';
  @Input() maxPlaceholder = 'Max';

  @Input() minVal: number | null = null;
  @Input() maxVal: number | null = null;

  @Output() minValChange = new EventEmitter<number | null>();
  @Output() maxValChange = new EventEmitter<number | null>();
  @Output() rangeChange = new EventEmitter<{ min: number | null; max: number | null }>();

  onMinChange(val: number | null) {
    this.minVal = val;
    this.minValChange.emit(this.minVal);
    this.rangeChange.emit({ min: this.minVal, max: this.maxVal });
  }

  onMaxChange(val: number | null) {
    this.maxVal = val;
    this.maxValChange.emit(this.maxVal);
    this.rangeChange.emit({ min: this.minVal, max: this.maxVal });
  }
}

