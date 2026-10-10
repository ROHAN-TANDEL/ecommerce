import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-slider-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="flex items-center gap-3 w-full h-9">
        <div class="flex-1 flex flex-col justify-center">
          <input
            type="range"
            [min]="min"
            [max]="max"
            [value]="value"
            (input)="onInput($event)"
            [disabled]="disabled"
            class="w-full accent-[#436CF3] cursor-pointer"
          />
          <div class="flex justify-between text-[9px] text-[#98A2B3] mt-0.5">
            <span>{{ min }}</span>
            <span>{{ max }}</span>
          </div>
        </div>
        <div class="w-11 h-8 rounded-lg border border-[#D0D5DD] bg-white flex items-center justify-center text-xs font-semibold text-[#344054] shadow-sm">
          {{ value }}
        </div>
      </div>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraSliderInputComponent {
  @Input() label: string = 'Volume';
  @Input() badge: string = '';
  @Input() helper: string = '';
  @Input() hint: string = '';
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() value: number = 50;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<number>();

  onInput(e: Event): void {
    const val = Number((e.target as HTMLInputElement).value);
    this.value = val;
    this.valueChange.emit(val);
  }
}

export { NexoraSliderInputComponent as NexoraSliderInput };

