import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-date-range-input',
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
        <div class="relative flex-1">
          <input
            type="date"
            [disabled]="disabled"
            [(ngModel)]="startDate"
            (ngModelChange)="onStartChange($event)"
            [max]="endDate || max"
            [min]="min"
            class="w-full h-9 px-2.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                   focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                   disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
          />
        </div>

        <span class="text-xs font-semibold text-[#98A2B3] shrink-0">to</span>

        <div class="relative flex-1">
          <input
            type="date"
            [disabled]="disabled"
            [(ngModel)]="endDate"
            (ngModelChange)="onEndChange($event)"
            [min]="startDate || min"
            [max]="max"
            class="w-full h-9 px-2.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                   focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                   disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraDateRangeInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() min = '';
  @Input() max = '';

  @Input() startDate = '';
  @Input() endDate = '';

  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() rangeChange = new EventEmitter<{ start: string; end: string }>();

  onStartChange(val: string) {
    this.startDate = val;
    this.startDateChange.emit(this.startDate);
    this.rangeChange.emit({ start: this.startDate, end: this.endDate });
  }

  onEndChange(val: string) {
    this.endDate = val;
    this.endDateChange.emit(this.endDate);
    this.rangeChange.emit({ start: this.startDate, end: this.endDate });
  }
}

