import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-url-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="flex items-center w-full rounded-lg border border-[#D0D5DD] bg-white transition focus-within:border-[#436CF3] focus-within:ring-2 focus-within:ring-blue-100 overflow-hidden">
        <span class="inline-flex items-center gap-1 bg-[#F9FAFB] border-r border-[#D0D5DD] px-2.5 h-9 text-xs text-[#667085]">
          <span>🔗</span>
          <span>https://</span>
        </span>
        <input
          type="text"
          [value]="value"
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="h-9 flex-1 bg-white px-2.5 text-xs text-[#101828] outline-none placeholder:text-[#98A2B3] disabled:bg-[#F2F4F7]"
        />
      </div>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraUrlInputComponent {
  @Input() label: string = 'Website';
  @Input() badge: string = '';
  @Input() placeholder: string = 'example.com';
  @Input() helper: string = 'Enter a valid URL';
  @Input() hint: string = '';
  @Input() value: string = 'example.com';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}

export { NexoraUrlInputComponent as NexoraUrlInput };

