import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-currency-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="flex items-center w-full rounded-lg border border-[#D0D5DD] bg-white transition focus-within:border-[#436CF3] focus-within:ring-2 focus-within:ring-blue-100 relative">
        <span class="inline-flex items-center justify-center bg-[#F9FAFB] border-r border-[#D0D5DD] px-3 h-9 text-xs font-medium text-[#667085] rounded-l-lg">
          {{ currencySymbol }}
        </span>
        <input
          type="text"
          [value]="formattedValue"
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="h-9 w-full bg-transparent px-3 text-xs text-[#101828] outline-none disabled:bg-[#F2F4F7]"
        />
        <div class="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <button type="button" (click)="stepUp()" class="h-3.5 w-4 flex items-center justify-center text-[8px] text-[#667085] hover:text-[#436CF3]">▲</button>
          <button type="button" (click)="stepDown()" class="h-3.5 w-4 flex items-center justify-center text-[8px] text-[#667085] hover:text-[#436CF3]">▼</button>
        </div>
      </div>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraCurrencyInputComponent {
  @Input() label: string = 'Price';
  @Input() badge: string = '';
  @Input() currencySymbol: string = '$';
  @Input() placeholder: string = '1,250.00';
  @Input() helper: string = 'Enter amount in USD';
  @Input() hint: string = '';
  @Input() value: number = 1250.00;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<number>();

  get formattedValue(): string {
    return this.value != null ? Number(this.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  }

  onInput(e: Event): void {
    const raw = (e.target as HTMLInputElement).value.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(raw);
    this.value = isNaN(num) ? 0 : num;
    this.valueChange.emit(this.value);
  }

  stepUp(): void {
    this.value = (this.value || 0) + 50;
    this.valueChange.emit(this.value);
  }

  stepDown(): void {
    this.value = Math.max(0, (this.value || 0) - 50);
    this.valueChange.emit(this.value);
  }
}

export { NexoraCurrencyInputComponent as NexoraCurrencyInput };

