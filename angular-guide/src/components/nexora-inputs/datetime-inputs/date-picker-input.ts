import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-date-picker-input',
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

      <div class="relative">
        <input
          type="date"
          [disabled]="disabled"
          [(ngModel)]="value"
          (ngModelChange)="onModelChange($event)"
          [min]="min"
          [max]="max"
          class="w-full h-9 pl-9 pr-3 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                 focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                 disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
        />

        <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraDatePickerInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() min = '';
  @Input() max = '';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();

  onModelChange(val: string) {
    this.value = val;
    this.valueChange.emit(this.value);
  }
}
