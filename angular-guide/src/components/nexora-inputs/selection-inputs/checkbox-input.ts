import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-checkbox-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1">
      <label
        class="inline-flex items-start gap-2.5 cursor-pointer select-none group"
        [class.opacity-40]="disabled"
        [class.cursor-not-allowed]="disabled"
      >
        <div class="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            [(ngModel)]="checked"
            (ngModelChange)="onModelChange($event)"
            [disabled]="disabled"
            class="peer sr-only"
          />
          <div
            class="w-4 h-4 rounded border border-[#D0D5DD] bg-white transition-all flex items-center justify-center
                   peer-checked:border-[#436CF3] peer-checked:bg-[#436CF3] peer-focus:ring-2 peer-focus:ring-[#EFF4FF]"
            [class.border-[#436CF3]]="checked || indeterminate"
            [class.bg-[#436CF3]]="checked || indeterminate"
          >
            <!-- Checkmark icon -->
            <svg *ngIf="checked && !indeterminate" class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <!-- Indeterminate dash icon -->
            <svg *ngIf="indeterminate" class="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <rect x="3" y="8.5" width="14" height="3" rx="1.5" />
            </svg>
          </div>
        </div>

        <div class="flex flex-col">
          <span class="text-xs font-medium text-[#1D2939] group-hover:text-[#436CF3] transition-colors">
            {{ label }}
            <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
          </span>
          <span *ngIf="description" class="text-[10px] text-[#667085] leading-tight">
            {{ description }}
          </span>
        </div>
      </label>

      <span *ngIf="hint" class="text-[10px] text-[#667085] ml-6">{{ hint }}</span>
    </div>
  `
})
export class NexoraCheckboxInputComponent {
  @Input() label = '';
  @Input() description = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() indeterminate = false;
  @Input() checked = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  onModelChange(val: boolean) {
    this.checked = val;
    this.indeterminate = false;
    this.checkedChange.emit(this.checked);
  }
}
