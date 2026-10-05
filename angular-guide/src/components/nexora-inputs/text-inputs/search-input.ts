import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="relative w-full">
        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3]">⌕</span>
        <input
          type="text"
          [value]="value"
          (input)="onInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="h-9 w-full rounded-lg border border-[#D0D5DD] bg-white pl-8 pr-7 text-xs text-[#101828] outline-none transition
                 placeholder:text-[#98A2B3] focus:border-[#436CF3] focus:ring-2 focus:ring-blue-100 disabled:bg-[#F2F4F7]"
        />
        <button
          *ngIf="value"
          type="button"
          (click)="clear()"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3] hover:text-[#344054]">
          ✕
        </button>
      </div>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraSearchInputComponent {
  @Input() label: string = 'Search';
  @Input() badge: string = '';
  @Input() placeholder: string = 'Search users...';
  @Input() helper: string = 'Type to search';
  @Input() hint: string = '';
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }

  clear(): void {
    this.value = '';
    this.valueChange.emit('');
  }
}

export { NexoraSearchInputComponent as NexoraSearchInput };

