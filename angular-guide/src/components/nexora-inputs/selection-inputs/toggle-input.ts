import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-toggle-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between gap-4 py-1">
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-semibold text-[#344054]">
            {{ label }}
            <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
          </span>
          <span *ngIf="badge" class="text-[10px] font-medium text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">
            {{ badge }}
          </span>
        </div>
        <span *ngIf="description" class="text-[10px] text-[#667085] leading-tight mt-0.5">
          {{ description }}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked"
        [disabled]="disabled"
        (click)="toggle()"
        class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#EFF4FF] disabled:opacity-40 disabled:cursor-not-allowed"
        [class.bg-[#436CF3]]="checked"
        [class.bg-[#EAECF0]]="!checked"
      >
        <span
          class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
          [class.translate-x-4]="checked"
          [class.translate-x-0]="!checked"
        ></span>
      </button>
    </div>
  `
})
export class NexoraToggleInputComponent {
  @Input() label = '';
  @Input() description = '';
  @Input() badge = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() checked = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}
