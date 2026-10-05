import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-datetime-range-input',
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
            type="datetime-local"
            [disabled]="disabled"
            [(ngModel)]="startDateTime"
            (ngModelChange)="onStartChange($event)"
            class="w-full h-9 px-2 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                   focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                   disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
          />
        </div>

        <span class="text-xs font-semibold text-[#98A2B3] shrink-0">to</span>

        <div class="relative flex-1">
          <input
            type="datetime-local"
            [disabled]="disabled"
            [(ngModel)]="endDateTime"
            (ngModelChange)="onEndChange($event)"
            class="w-full h-9 px-2 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                   focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                   disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraDatetimeRangeInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;

  @Input() startDateTime = '';
  @Input() endDateTime = '';

  @Output() startDateTimeChange = new EventEmitter<string>();
  @Output() endDateTimeChange = new EventEmitter<string>();
  @Output() rangeChange = new EventEmitter<{ start: string; end: string }>();

  onStartChange(val: string) {
    this.startDateTime = val;
    this.startDateTimeChange.emit(this.startDateTime);
    this.rangeChange.emit({ start: this.startDateTime, end: this.endDateTime });
  }

  onEndChange(val: string) {
    this.endDateTime = val;
    this.endDateTimeChange.emit(this.endDateTime);
    this.rangeChange.emit({ start: this.startDateTime, end: this.endDateTime });
  }
}

