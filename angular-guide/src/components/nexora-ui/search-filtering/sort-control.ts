import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SortField {
  label: string;
  key: string;
}

@Component({
  selector: 'nexora-sort-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5 p-1 rounded-lg border border-[#D0D5DD] bg-white text-xs">
      <span class="text-[#667085] pl-1 font-medium">Sort by:</span>

      <select
        [value]="selectedKey"
        (change)="onKeyChange($event)"
        class="h-7 pl-1.5 pr-6 bg-transparent font-semibold text-[#101828] outline-none cursor-pointer"
      >
        <option *ngFor="let f of fields" [value]="f.key">{{ f.label }}</option>
      </select>

      <button
        type="button"
        (click)="toggleDirection()"
        class="h-7 px-2 rounded-md hover:bg-[#F2F4F7] font-semibold text-[#436CF3] flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span>{{ direction === 'asc' ? '↑ Asc' : '↓ Desc' }}</span>
      </button>
    </div>
  `
})
export class NexoraSortControlComponent {
  @Input() fields: SortField[] = [];
  @Input() selectedKey = '';
  @Input() direction: 'asc' | 'desc' = 'asc';

  @Output() selectedKeyChange = new EventEmitter<string>();
  @Output() directionChange = new EventEmitter<'asc' | 'desc'>();
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();

  onKeyChange(e: any): void {
    this.selectedKey = e.target.value;
    this.selectedKeyChange.emit(this.selectedKey);
    this.sortChange.emit({ key: this.selectedKey, direction: this.direction });
  }

  toggleDirection(): void {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.directionChange.emit(this.direction);
    this.sortChange.emit({ key: this.selectedKey, direction: this.direction });
  }
}

@Component({
  selector: 'nexora-quick-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[#F2F4F7] border border-[#EAECF0]">
      <button
        *ngFor="let opt of options"
        type="button"
        (click)="select(opt.value)"
        class="h-7 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer select-none flex items-center gap-1.5"
        [class.bg-white]="opt.value === activeValue"
        [class.text-[#101828]]="opt.value === activeValue"
        [class.shadow-2xs]="opt.value === activeValue"
        [class.text-[#667085]]="opt.value !== activeValue"
        [class.hover:text-[#101828]]="opt.value !== activeValue"
      >
        <span>{{ opt.label }}</span>
        <span
          *ngIf="opt.count !== undefined"
          class="text-[10px] font-bold px-1.5 py-0.2 rounded-full"
          [class.bg-[#EFF4FF]]="opt.value === activeValue"
          [class.text-[#436CF3]]="opt.value === activeValue"
          [class.bg-[#E4E7EC]]="opt.value !== activeValue"
          [class.text-[#667085]]="opt.value !== activeValue"
        >
          {{ opt.count }}
        </span>
      </button>
    </div>
  `
})
export class NexoraQuickFiltersComponent {
  @Input() options: { label: string; value: any; count?: number }[] = [];
  @Input() activeValue: any = null;

  @Output() activeValueChange = new EventEmitter<any>();

  select(val: any): void {
    this.activeValue = val;
    this.activeValueChange.emit(this.activeValue);
  }
}
