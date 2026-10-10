import { Component, EventEmitter, Input, Output, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-otp-input',
  standalone: true,
  imports: [CommonModule],
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

      <div class="flex items-center gap-2">
        <input
          #inputEl
          *ngFor="let digit of digits; let i = index"
          type="text"
          maxlength="1"
          inputmode="numeric"
          [value]="digits[i]"
          [disabled]="disabled"
          (input)="onInput($event, i)"
          (keydown)="onKeydown($event, i)"
          (paste)="onPaste($event)"
          class="w-10 h-10 text-center rounded-lg border border-[#D0D5DD] bg-white text-sm font-semibold text-[#1D2939]
                 focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                 disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
        />
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraOtpInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() length = 6;

  @Output() codeComplete = new EventEmitter<string>();
  @Output() codeChange = new EventEmitter<string>();

  @ViewChildren('inputEl') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = [];

  ngOnInit() {
    this.digits = new Array(this.length).fill('');
  }

  onInput(e: any, index: number) {
    const val = e.target.value.replace(/[^0-9]/g, '');
    this.digits[index] = val ? val[0] : '';
    e.target.value = this.digits[index];

    const currentCode = this.digits.join('');
    this.codeChange.emit(currentCode);

    if (this.digits[index] && index < this.length - 1) {
      const inputArr = this.inputs.toArray();
      inputArr[index + 1]?.nativeElement.focus();
    }

    if (currentCode.length === this.length) {
      this.codeComplete.emit(currentCode);
    }
  }

  onKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Backspace' && !this.digits[index] && index > 0) {
      const inputArr = this.inputs.toArray();
      inputArr[index - 1]?.nativeElement.focus();
    }
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text').trim() || '';
    const digitsOnly = pasted.replace(/[^0-9]/g, '').slice(0, this.length);
    for (let i = 0; i < this.length; i++) {
      this.digits[i] = digitsOnly[i] || '';
    }
    const currentCode = this.digits.join('');
    this.codeChange.emit(currentCode);
    if (currentCode.length === this.length) {
      this.codeComplete.emit(currentCode);
    }
  }
}
