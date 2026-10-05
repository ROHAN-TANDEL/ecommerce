import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="relative w-full">
        <input
          [type]="showPassword ? 'text' : 'password'"
          [value]="value"
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="h-9 w-full rounded-lg border border-[#D0D5DD] bg-white pl-3 pr-8 text-xs text-[#101828] outline-none transition
                 placeholder:text-[#98A2B3] focus:border-[#436CF3] focus:ring-2 focus:ring-blue-100 disabled:bg-[#F2F4F7]"
        />
        <button
          type="button"
          (click)="showPassword = !showPassword"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3] hover:text-[#344054]">
          {{ showPassword ? '🙈' : '👁' }}
        </button>
      </div>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraPasswordInputComponent {
  @Input() label: string = 'Password';
  @Input() badge: string = '';
  @Input() placeholder: string = '••••••••';
  @Input() helper: string = 'Min 8 characters';
  @Input() hint: string = '';
  @Input() value: string = 'password123';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  showPassword = false;

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}

export { NexoraPasswordInputComponent as NexoraPasswordInput };

