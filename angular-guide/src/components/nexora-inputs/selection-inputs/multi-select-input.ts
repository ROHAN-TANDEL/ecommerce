import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectOption } from './select-input';

@Component({
  selector: 'nexora-multi-select-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1 w-full relative">
      <div class="flex items-center justify-between">
        <label *ngIf="label" class="text-xs font-semibold text-[#344054]">
          {{ label }}
          <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
        </label>
        <span *ngIf="badge" class="text-[10px] font-medium text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">
          {{ badge }}
        </span>
      </div>

      <!-- Trigger box displaying chips -->
      <div
        (click)="toggleOpen()"
        [class.border-[#436CF3]]="isOpen"
        [class.ring-2]="isOpen"
        [class.ring-[#EFF4FF]]="isOpen"
        class="min-h-9 px-2 py-1.5 rounded-lg border border-[#D0D5DD] bg-white flex flex-wrap items-center gap-1.5 cursor-pointer transition-all"
      >
        <div *ngFor="let val of values" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFF4FF] text-[#436CF3] text-[11px] font-medium">
          <span>{{ getOptionLabel(val) }}</span>
          <button type="button" (click)="removeItem(val, $event)" class="hover:text-red-600 focus:outline-none">
            <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <span *ngIf="values.length === 0" class="text-xs text-[#98A2B3] px-1">{{ placeholder }}</span>

        <svg class="w-4 h-4 text-[#667085] ml-auto shrink-0 transition-transform duration-200" [class.rotate-180]="isOpen" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </div>

      <!-- Dropdown -->
      <div
        *ngIf="isOpen"
        class="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white rounded-lg border border-[#EAECF0] shadow-lg py-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
      >
        <button
          *ngFor="let opt of options"
          type="button"
          (click)="toggleOption(opt)"
          [disabled]="opt.disabled"
          class="w-full px-3 py-2 text-xs flex items-center justify-between text-left hover:bg-[#F8F9FC] transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              [checked]="isSelected(opt.value)"
              class="w-3.5 h-3.5 rounded border-[#D0D5DD] text-[#436CF3] focus:ring-0 cursor-pointer pointer-events-none"
            />
            <span class="text-[#1D2939]">{{ opt.label }}</span>
          </div>
          <span *ngIf="opt.badge" class="text-[10px] text-[#667085] bg-[#F2F4F7] px-1.5 py-0.5 rounded">{{ opt.badge }}</span>
        </button>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraMultiSelectInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() placeholder = 'Select multiple...';
  @Input() required = false;
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];
  @Input() values: any[] = [];

  @Output() valuesChange = new EventEmitter<any[]>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  toggleOpen() {
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  isSelected(val: any): boolean {
    return this.values.includes(val);
  }

  getOptionLabel(val: any): string {
    const opt = this.options.find(o => o.value === val);
    return opt ? opt.label : String(val);
  }

  removeItem(val: any, e: MouseEvent) {
    e.stopPropagation();
    this.values = this.values.filter(v => v !== val);
    this.valuesChange.emit(this.values);
  }

  toggleOption(opt: SelectOption) {
    if (this.isSelected(opt.value)) {
      this.values = this.values.filter(v => v !== opt.value);
    } else {
      this.values = [...this.values, opt.value];
    }
    this.valuesChange.emit(this.values);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
