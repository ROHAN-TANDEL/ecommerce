import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-percentage-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="flex items-center w-full rounded-lg border border-[#D0D5DD] bg-white transition focus-within:border-[#436CF3] focus-within:ring-2 focus-within:ring-blue-100 relative">
        <input
          type="number"
          min="0"
          max="100"
          [value]="value"
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="h-9 w-full bg-transparent pl-3 pr-10 text-xs text-[#101828] outline-none disabled:bg-[#F2F4F7] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span class="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-medium text-[#667085]">%</span>
        <div class="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <button type="button" (click)="stepUp()" class="h-3.5 w-4 flex items-center justify-center text-[8px] text-[#667085] hover:text-[#436CF3]">▲</button>
          <button type="button" (click)="stepDown()" class="h-3.5 w-4 flex items-center justify-center text-[8px] text-[#667085] hover:text-[#436CF3]">▼</button>
        </div>
      </div>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraPercentageInputComponent {
  @Input() label: string = 'Tax Rate';
  @Input() badge: string = '';
  @Input() placeholder: string = '25';
  @Input() helper: string = 'Enter percentage (0-100)';
  @Input() hint: string = '';
  @Input() value: number = 25;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<number>();

  onInput(e: Event): void {
    const val = Number((e.target as HTMLInputElement).value);
    this.value = Math.min(100, Math.max(0, val));
    this.valueChange.emit(this.value);
  }

  stepUp(): void {
    this.value = Math.min(100, (this.value || 0) + 1);
    this.valueChange.emit(this.value);
  }

  stepDown(): void {
    this.value = Math.max(0, (this.value || 0) - 1);
    this.valueChange.emit(this.value);
  }
}

export { NexoraPercentageInputComponent as NexoraPercentageInput };

