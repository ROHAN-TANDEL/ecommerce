import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeaderTab {
  id: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'nexora-master-table-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-6 py-5 border-b border-[#EAECF0] bg-white rounded-t-2xl select-none">
      <!-- Title & Action CTA Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-[#101828] tracking-tight">{{ title }}</h2>
            @if (totalCount !== undefined) {
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF4FF] text-[#436CF3] border border-[#D1E0FF]">
                {{ filteredCount !== undefined && filteredCount !== totalCount ? (filteredCount + ' / ') : '' }}{{ totalCount }} total
              </span>
            }
          </div>
          @if (description) {
            <p class="text-xs text-[#667085] mt-1">{{ description }}</p>
          }
        </div>

        <!-- Top Right Actions -->
        <div class="flex items-center gap-2.5">
          @if (secondaryActionLabel) {
            <button
              type="button"
              (click)="secondaryAction.emit()"
              class="px-3.5 py-2 text-xs font-semibold text-[#344054] bg-white border border-[#D0D5DD] hover:bg-[#F9FAFB] rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {{ secondaryActionLabel }}
            </button>
          }
          @if (primaryActionLabel) {
            <button
              type="button"
              (click)="primaryAction.emit()"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#436CF3] hover:bg-[#3257D7] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>+</span>
              <span>{{ primaryActionLabel }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Quick View Tabs Row (Optional) -->
      @if (tabs && tabs.length > 0) {
        <div class="flex items-center gap-1 mt-4 pt-3 border-t border-[#F2F4F7] overflow-x-auto scrollbar-none">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              (click)="selectTab(tab.id)"
              [class]="activeTabId === tab.id ? 'border-[#436CF3] text-[#436CF3] bg-[#EFF4FF]/60 font-semibold' : 'border-transparent text-[#667085] hover:text-[#344054] hover:bg-[#F9FAFB] font-medium'"
              class="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{{ tab.label }}</span>
              @if (tab.count !== undefined) {
                <span
                  [class]="activeTabId === tab.id ? 'bg-[#436CF3] text-white' : 'bg-[#EAECF0] text-[#667085]'"
                  class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                >
                  {{ tab.count }}
                </span>
              }
            </button>
          }
        </div>
      }
    </div>
  `
})
export class MasterTableHeaderComponent {
  @Input() title = 'Enterprise Customer Accounts';
  @Input() description = 'Manage enterprise subscriptions, contracts, billing statuses, and assigned regional directors.';
  @Input() totalCount?: number = 148;
  @Input() filteredCount?: number;
  @Input() tabs: HeaderTab[] = [
    { id: 'all', label: 'All Accounts', count: 148 },
    { id: 'active', label: 'Active', count: 104 },
    { id: 'pending', label: 'Pending Review', count: 28 },
    { id: 'suspended', label: 'Suspended', count: 16 }
  ];
  @Input() activeTabId = 'all';
  @Input() primaryActionLabel = 'Add Customer';
  @Input() secondaryActionLabel = 'Import CSV';

  @Output() tabChange = new EventEmitter<string>();
  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  selectTab(tabId: string) {
    this.activeTabId = tabId;
    this.tabChange.emit(tabId);
  }
}
