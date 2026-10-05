import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* --- Inline Text Cell --- */
@Component({
  selector: 'nexora-cell-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full group">
      <input
        type="text"
        [(ngModel)]="value"
        (ngModelChange)="valueChange.emit($event)"
        [placeholder]="placeholder"
        class="w-full h-7 px-2 text-xs font-medium text-[#1D2939] rounded border border-transparent hover:border-[#D0D5DD] focus:border-[#436CF3] focus:ring-1 focus:ring-[#EFF4FF] bg-transparent focus:bg-white outline-none transition-all"
      />
    </div>
  `
})
export class NexoraCellTextComponent {
  @Input() value = '';
  @Input() placeholder = 'Edit text...';
  @Output() valueChange = new EventEmitter<string>();
}

/* --- Inline Number Cell --- */
@Component({
  selector: 'nexora-cell-number',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full group">
      <input
        type="number"
        [(ngModel)]="value"
        (ngModelChange)="valueChange.emit($event)"
        [placeholder]="placeholder"
        class="w-full h-7 px-2 text-xs font-medium text-[#1D2939] text-right rounded border border-transparent hover:border-[#D0D5DD] focus:border-[#436CF3] focus:ring-1 focus:ring-[#EFF4FF] bg-transparent focus:bg-white outline-none transition-all"
      />
    </div>
  `
})
export class NexoraCellNumberComponent {
  @Input() value: number | null = null;
  @Input() placeholder = '0';
  @Output() valueChange = new EventEmitter<number | null>();
}

/* --- Inline Select Cell --- */
@Component({
  selector: 'nexora-cell-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full">
      <select
        [(ngModel)]="value"
        (ngModelChange)="valueChange.emit($event)"
        class="w-full h-7 pl-2 pr-6 text-xs font-medium text-[#1D2939] rounded border border-transparent hover:border-[#D0D5DD] focus:border-[#436CF3] focus:ring-1 focus:ring-[#EFF4FF] bg-transparent focus:bg-white outline-none transition-all appearance-none cursor-pointer"
      >
        <option *ngFor="let opt of options" [value]="opt.value">{{ opt.label }}</option>
      </select>
      <div class="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#98A2B3]">
        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
  `
})
export class NexoraCellSelectComponent {
  @Input() value: any = '';
  @Input() options: { label: string; value: any }[] = [];
  @Output() valueChange = new EventEmitter<any>();
}

/* --- Inline Checkbox Cell --- */
@Component({
  selector: 'nexora-cell-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-center p-1">
      <input
        type="checkbox"
        [(ngModel)]="checked"
        (ngModelChange)="checkedChange.emit($event)"
        class="w-4 h-4 rounded border-[#D0D5DD] text-[#436CF3] focus:ring-0 cursor-pointer"
      />
    </div>
  `
})
export class NexoraCellCheckboxComponent {
  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();
}

/* --- Inline Toggle Cell --- */
@Component({
  selector: 'nexora-cell-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center py-1">
      <button
        type="button"
        (click)="toggle()"
        class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200"
        [class.bg-[#436CF3]]="checked"
        [class.bg-[#E4E7EC]]="!checked"
      >
        <span
          class="inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200"
          [class.translate-x-3]="checked"
          [class.translate-x-0.5]="!checked"
        ></span>
      </button>
    </div>
  `
})
export class NexoraCellToggleComponent {
  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle() {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}

/* --- Inline Date Cell --- */
@Component({
  selector: 'nexora-cell-date',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full">
      <input
        type="date"
        [(ngModel)]="value"
        (ngModelChange)="valueChange.emit($event)"
        class="w-full h-7 px-2 text-xs font-medium text-[#1D2939] rounded border border-transparent hover:border-[#D0D5DD] focus:border-[#436CF3] focus:ring-1 focus:ring-[#EFF4FF] bg-transparent focus:bg-white outline-none transition-all cursor-pointer"
      />
    </div>
  `
})
export class NexoraCellDateComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}
