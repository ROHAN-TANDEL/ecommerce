import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActiveFilter {
  id: string;
  field: string;
  value: string;
}

@Component({
  selector: 'nexora-filter-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#D0D5DD] bg-white text-xs shadow-2xs hover:bg-[#F9FAFB] transition-all">
      <span class="font-medium text-[#667085]">{{ field }}:</span>
      <span class="font-semibold text-[#101828]">{{ value }}</span>
      <button
        *ngIf="removable"
        type="button"
        (click)="removed.emit()"
        class="text-[#98A2B3] hover:text-[#B42318] focus:outline-none cursor-pointer ml-0.5"
      >
        &times;
      </button>
    </span>
  `
})
export class NexoraFilterChipComponent {
  @Input() field = '';
  @Input() value = '';
  @Input() removable = true;

  @Output() removed = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-filter-group',
  standalone: true,
  imports: [CommonModule, NexoraFilterChipComponent],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <!-- Filter Chips -->
      <nexora-filter-chip
        *ngFor="let f of filters"
        [field]="f.field"
        [value]="f.value"
        (removed)="removeFilter(f)"
      ></nexora-filter-chip>

      <!-- [ + Filter ] Add trigger -->
      <button
        type="button"
        (click)="addFilterClicked.emit()"
        class="h-7 px-2.5 rounded-lg border border-dashed border-[#D0D5DD] hover:border-[#436CF3] hover:text-[#436CF3] bg-white text-xs font-semibold text-[#475467] flex items-center gap-1 transition-colors cursor-pointer"
      >
        <span>+</span>
        <span>Filter</span>
      </button>

      <!-- Clear All -->
      <button
        *ngIf="filters.length > 0"
        type="button"
        (click)="clearAll()"
        class="text-xs font-medium text-[#667085] hover:text-[#B42318] hover:underline cursor-pointer ml-1"
      >
        Clear all
      </button>
    </div>
  `
})
export class NexoraFilterGroupComponent {
  @Input() filters: ActiveFilter[] = [];

  @Output() filtersChange = new EventEmitter<ActiveFilter[]>();
  @Output() addFilterClicked = new EventEmitter<void>();

  removeFilter(target: ActiveFilter): void {
    this.filters = this.filters.filter(f => f.id !== target.id);
    this.filtersChange.emit(this.filters);
  }

  clearAll(): void {
    this.filters = [];
    this.filtersChange.emit(this.filters);
  }
}
