import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-year-picker-input',
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

      <div class="relative flex items-center">
        <button
          type="button"
          (click)="stepYear(-1)"
          [disabled]="disabled || (minYear !== null && year <= minYear)"
          class="absolute left-1.5 z-10 w-6 h-6 flex items-center justify-center rounded hover:bg-[#F2F4F7] text-[#667085] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
          </svg>
        </button>

        <input
          type="number"
          [disabled]="disabled"
          [(ngModel)]="year"
          (ngModelChange)="onYearChange($event)"
          [min]="minYear ?? 1900"
          [max]="maxYear ?? 2100"
          class="w-full h-9 px-8 text-center rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#1D2939]
                 focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                 disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
        />

        <button
          type="button"
          (click)="stepYear(1)"
          [disabled]="disabled || (maxYear !== null && year >= maxYear)"
          class="absolute right-1.5 z-10 w-6 h-6 flex items-center justify-center rounded hover:bg-[#F2F4F7] text-[#667085] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraYearPickerInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() minYear: number | null = 1900;
  @Input() maxYear: number | null = 2100;
  @Input() year = new Date().getFullYear();

  @Output() yearChange = new EventEmitter<number>();

  stepYear(delta: number) {
    if (this.disabled) return;
    this.year += delta;
    this.yearChange.emit(this.year);
  }

  onYearChange(val: number) {
    this.year = val;
    this.yearChange.emit(this.year);
  }
}
