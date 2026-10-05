import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableFilterCriteria {
  status: string;
  industry: string;
  country: string;
  minRevenue: number | null;
}

@Component({
  selector: 'nexora-master-table-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-6 py-3 bg-[#F9FAFB] border-b border-[#EAECF0] flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      <!-- Quick Filter Selectors -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-[11px] font-bold uppercase text-[#667085] tracking-wider mr-1">Quick Filters:</span>

        <!-- Status Filter -->
        <select
          [(ngModel)]="filters.status"
          (ngModelChange)="onFilterChange()"
          class="bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs text-[#344054] focus:outline-none focus:border-[#436CF3]"
        >
          <option value="">Status: All</option>
          <option value="Active">Status: Active</option>
          <option value="Pending">Status: Pending</option>
          <option value="Suspended">Status: Suspended</option>
          <option value="Inactive">Status: Inactive</option>
        </select>

        <!-- Industry Filter -->
        <select
          [(ngModel)]="filters.industry"
          (ngModelChange)="onFilterChange()"
          class="bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs text-[#344054] focus:outline-none focus:border-[#436CF3]"
        >
          <option value="">Industry: All</option>
          <option value="Fintech">Fintech</option>
          <option value="SaaS">SaaS</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Energy">Energy</option>
        </select>

        <!-- Country Filter -->
        <select
          [(ngModel)]="filters.country"
          (ngModelChange)="onFilterChange()"
          class="bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs text-[#344054] focus:outline-none focus:border-[#436CF3]"
        >
          <option value="">Country: All</option>
          <option value="India">🇮🇳 India</option>
          <option value="USA">🇺🇸 USA</option>
          <option value="Germany">🇩🇪 Germany</option>
          <option value="UK">🇬🇧 UK</option>
          <option value="Singapore">🇸🇬 Singapore</option>
        </select>

        <!-- Revenue Filter -->
        <select
          [(ngModel)]="filters.minRevenue"
          (ngModelChange)="onFilterChange()"
          class="bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs text-[#344054] focus:outline-none focus:border-[#436CF3]"
        >
          <option [ngValue]="null">Revenue: Any</option>
          <option [ngValue]="1000000">&gt; ₹1,000,000</option>
          <option [ngValue]="5000000">&gt; ₹5,000,000</option>
          <option [ngValue]="10000000">&gt; ₹10,000,000</option>
        </select>
      </div>

      <!-- Active Filter Count & Reset Button -->
      <div class="flex items-center gap-2">
        @if (hasActiveFilters) {
          <span class="text-[11px] text-[#436CF3] font-semibold bg-[#EFF4FF] px-2 py-0.5 rounded-full">
            {{ activeCount }} active
          </span>
          <button
            type="button"
            (click)="resetFilters()"
            class="text-xs text-[#667085] hover:text-[#B42318] hover:underline cursor-pointer transition-colors"
          >
            Clear all filters
          </button>
        } @else {
          <span class="text-[11px] text-[#98A2B3]">No active filters</span>
        }
      </div>
    </div>
  `
})
export class MasterTableFilterBarComponent {
  @Input() filters: TableFilterCriteria = {
    status: '',
    industry: '',
    country: '',
    minRevenue: null
  };

  @Output() filterChange = new EventEmitter<TableFilterCriteria>();
  @Output() filterReset = new EventEmitter<void>();

  get hasActiveFilters(): boolean {
    return !!(this.filters.status || this.filters.industry || this.filters.country || this.filters.minRevenue);
  }

  get activeCount(): number {
    let count = 0;
    if (this.filters.status) count++;
    if (this.filters.industry) count++;
    if (this.filters.country) count++;
    if (this.filters.minRevenue) count++;
    return count;
  }

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  resetFilters() {
    this.filters = {
      status: '',
      industry: '',
      country: '',
      minRevenue: null
    };
    this.filterReset.emit();
    this.filterChange.emit(this.filters);
  }
}
