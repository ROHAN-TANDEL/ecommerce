import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'nexora-select-input',
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

      <!-- Trigger button -->
      <button
        type="button"
        (click)="toggleOpen()"
        [disabled]="disabled"
        class="w-full h-9 px-3 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
               flex items-center justify-between gap-2 text-left transition-all
               focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
               disabled:bg-[#F8F9FC] disabled:cursor-not-allowed cursor-pointer"
        [class.border-[#436CF3]]="isOpen"
        [class.ring-2]="isOpen"
        [class.ring-[#EFF4FF]]="isOpen"
      >
        <div class="flex items-center gap-2 truncate">
          <i *ngIf="selectedOption?.icon" [class]="selectedOption?.icon + ' text-[#667085] text-xs'"></i>
          <span *ngIf="selectedOption; else placeholderTpl" class="truncate">
            {{ selectedOption.label }}
          </span>
          <ng-template #placeholderTpl>
            <span class="text-[#98A2B3] truncate">{{ placeholder }}</span>
          </ng-template>
        </div>

        <svg class="w-4 h-4 text-[#667085] shrink-0 transition-transform duration-200" [class.rotate-180]="isOpen" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        *ngIf="isOpen"
        class="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white rounded-lg border border-[#EAECF0] shadow-lg py-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
      >
        <button
          *ngFor="let opt of options"
          type="button"
          (click)="selectOption(opt)"
          [disabled]="opt.disabled"
          class="w-full px-3 py-2 text-xs flex items-center justify-between text-left hover:bg-[#F8F9FC] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          [class.bg-[#EFF4FF]]="opt.value === value"
          [class.text-[#436CF3]]="opt.value === value"
          [class.font-semibold]="opt.value === value"
          [class.text-[#1D2939]]="opt.value !== value"
        >
          <div class="flex items-center gap-2 truncate">
            <i *ngIf="opt.icon" [class]="opt.icon + ' text-xs text-[#667085]'"></i>
            <span class="truncate">{{ opt.label }}</span>
          </div>
          <svg *ngIf="opt.value === value" class="w-4 h-4 text-[#436CF3] shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraSelectInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() placeholder = 'Select option...';
  @Input() required = false;
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];
  @Input() value: any = null;

  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  get selectedOption(): SelectOption | undefined {
    return this.options.find(o => o.value === this.value);
  }

  toggleOpen() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  selectOption(opt: SelectOption) {
    if (opt.disabled) return;
    this.value = opt.value;
    this.valueChange.emit(this.value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
