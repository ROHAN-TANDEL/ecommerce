import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-textarea-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <textarea
        [rows]="rows"
        [value]="value"
        (input)="onInput($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        class="w-full rounded-lg border border-[#D0D5DD] bg-white p-2.5 text-xs text-[#101828] outline-none transition
               placeholder:text-[#98A2B3] focus:border-[#436CF3] focus:ring-2 focus:ring-blue-100 disabled:bg-[#F2F4F7] resize-y"
      ></textarea>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraTextareaInputComponent {
  @Input() label: string = 'Address';
  @Input() badge: string = '';
  @Input() placeholder: string = '123 Main Street,\nBangalore, Karnataka';
  @Input() helper: string = 'Enter address details';
  @Input() hint: string = '';
  @Input() value: string = '';
  @Input() rows: number = 2;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  onInput(e: Event): void {
    const val = (e.target as HTMLTextAreaElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}

export { NexoraTextareaInputComponent as NexoraTextareaInput };

