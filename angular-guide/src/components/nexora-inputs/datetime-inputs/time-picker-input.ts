import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-time-picker-input',
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
          type="time"
          [disabled]="disabled"
          [(ngModel)]="value"
          (ngModelChange)="onModelChange($event)"
          class="w-full h-9 pl-9 pr-3 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                 focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                 disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
        />

        <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraTimePickerInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() value = '09:00';

  @Output() valueChange = new EventEmitter<string>();

  onModelChange(val: string) {
    this.value = val;
    this.valueChange.emit(this.value);
  }
}
