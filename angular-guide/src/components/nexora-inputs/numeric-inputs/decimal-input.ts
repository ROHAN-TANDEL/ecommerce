import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-decimal-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="flex items-center w-full rounded-lg border border-[#D0D5DD] bg-white transition focus-within:border-[#436CF3] focus-within:ring-2 focus-within:ring-blue-100 relative">
        <input
          type="number"
          step="0.01"
          [value]="value"
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="h-9 w-full bg-transparent pl-3 pr-8 text-xs text-[#101828] outline-none disabled:bg-[#F2F4F7] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
export class NexoraDecimalInputComponent {
  @Input() label: string = 'Amount';
  @Input() badge: string = '';
  @Input() placeholder: string = '1250.50';
  @Input() helper: string = 'Supports decimal values';
  @Input() hint: string = '';
  @Input() precision: number = 2;
  @Input() value: number = 1250.50;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<number>();

  onInput(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.value = isNaN(val) ? 0 : Number(val.toFixed(this.precision));
    this.valueChange.emit(this.value);
  }

  stepUp(): void {
    this.value = Number(((this.value || 0) + 0.5).toFixed(this.precision));
    this.valueChange.emit(this.value);
  }

  stepDown(): void {
    this.value = Number(((this.value || 0) - 0.5).toFixed(this.precision));
    this.valueChange.emit(this.value);
  }
}

export { NexoraDecimalInputComponent as NexoraDecimalInput };

