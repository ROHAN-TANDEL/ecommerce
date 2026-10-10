import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasterTableHeaderComponent, HeaderTab } from './table-header';
import { MasterTableToolbarComponent, TableDensity, ColumnVisibilityItem } from './table-toolbar';
import { MasterTableFilterBarComponent, TableFilterCriteria } from './table-filter-bar';
import { MasterTableSelectionBarComponent } from './table-selection-bar';
import { MasterTableHeadComponent, TableColumnHeader } from './table-head';
import { MasterTableRowComponent } from './table-row';
import {
  MasterCellCustomerComponent,
  MasterCellStatusBadgeComponent,
  MasterCellRevenueComponent,
  MasterCellHealthProgressComponent,
  MasterCellTagsGroupComponent,
  MasterCellActionsDropdownComponent
} from './table-cells';
import { MasterTableRowDetailComponent } from './table-row-detail';
import { MasterTableFooterComponent } from './table-footer';
import { MasterTablePaginationComponent } from './table-pagination';
import { MasterTableEmptyComponent, MasterTableLoadingComponent, MasterTableErrorComponent } from './table-states';

export interface EnterpriseCustomer {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Inactive';
  industry: 'Fintech' | 'SaaS' | 'Healthcare' | 'Manufacturing' | 'Energy';
  country: string;
  flag: string;
  createdDate: string;
  revenue: number;
  growth: number;
  health: number;
  tags: string[];
  dedicatedRep: string;
}

@Component({
  selector: 'nexora-master-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MasterTableHeaderComponent,
    MasterTableToolbarComponent,
    MasterTableFilterBarComponent,
    MasterTableSelectionBarComponent,
    MasterTableHeadComponent,
    MasterTableRowComponent,
    MasterCellCustomerComponent,
    MasterCellStatusBadgeComponent,
    MasterCellRevenueComponent,
    MasterCellHealthProgressComponent,
    MasterCellTagsGroupComponent,
    MasterCellActionsDropdownComponent,
    MasterTableRowDetailComponent,
    MasterTableFooterComponent,
    MasterTablePaginationComponent,
    MasterTableEmptyComponent,
    MasterTableLoadingComponent,
    MasterTableErrorComponent
  ],
  template: `
    <div
      [class.fixed]="isFullscreen"
      [class.inset-0]="isFullscreen"
      [class.z-50]="isFullscreen"
      [class.p-6]="isFullscreen"
      [class.bg-slate-900/80]="isFullscreen"
      [class.backdrop-blur-sm]="isFullscreen"
      class="w-full transition-all"
    >
      <div class="w-full rounded-2xl border border-[#EAECF0] bg-white shadow-sm overflow-hidden flex flex-col">

        <!-- 1. Header Section -->
        <nexora-master-table-header
          [title]="title"
          [description]="description"
          [totalCount]="rawData.length"
          [filteredCount]="filteredData.length"
          [tabs]="headerTabs"
          [activeTabId]="activeTabId"
          (tabChange)="onTabChange($event)"
          (primaryAction)="onPrimaryAction()"
          (secondaryAction)="onSecondaryAction()"
        />

        <!-- 2. Toolbar Section -->
        <nexora-master-table-toolbar
          [searchQuery]="searchQuery"
          [density]="density"
          [columns]="columnVisibility"
          [activeFilterCount]="activeFilterCount"
          [isFilterActive]="showFilterBar"
          (searchChange)="onSearchChange($event)"
          (filterToggle)="showFilterBar = !showFilterBar"
          (densityChange)="density = $event"
          (autoRefreshToggle)="onAutoRefreshToggle($event)"
          (export)="onExport($event)"
          (fullscreenToggle)="isFullscreen = !isFullscreen"
          (columnVisibilityChange)="onColumnVisibilityChange($event)"
        />

        <!-- 3. Filter Bar Section (Collapsible) -->
        @if (showFilterBar) {
          <nexora-master-table-filter-bar
            [filters]="filters"
            (filterChange)="onFilterChange($event)"
            (filterReset)="onFilterReset()"
          />
        }

        <!-- 4. Bulk Selection Floating Banner -->
        <nexora-master-table-selection-bar
          [selectedCount]="selectedRowIds.size"
          [totalCount]="filteredData.length"
          (selectAllGlobal)="selectAllGlobal()"
          (bulkStatus)="onBulkAction('status')"
          (bulkAssign)="onBulkAction('assign')"
          (bulkExport)="onBulkAction('export')"
          (bulkDelete)="onBulkAction('delete')"
          (deselectAll)="deselectAll()"
        />

        <!-- 5. Main Table Grid -->
        <div class="w-full overflow-x-auto relative">
          <!-- Loading State Overlay -->
          @if (isLoading) {
            <nexora-master-table-loading />
          } @else if (isError) {
            <nexora-master-table-error (retry)="onRetry()" />
          } @else if (filteredData.length === 0) {
            <nexora-master-table-empty (reset)="resetAllFilters()" />
          } @else {
            <table class="w-full border-collapse text-left">
              <!-- Table Head -->
              <nexora-master-table-head
                [columns]="columns"
                [allSelected]="isAllPageSelected"
                [isIndeterminate]="isIndeterminate"
                (selectAllChange)="onSelectAllOnPage($event)"
                (sortChange)="onSortChange($event)"
              />

              <!-- Table Body -->
              <tbody>
                @for (row of paginatedData; track row.id) {
                  <!-- Standard / Master Table Row -->
                  <tr
                    nexora-master-table-row
                    [isSelected]="isRowSelected(row.id)"
                    [isExpanded]="isRowExpanded(row.id)"
                    [rowId]="row.id"
                    (selectChange)="onRowSelectChange(row.id, $event)"
                    (expandChange)="onRowExpandChange(row.id, $event)"
                  >
                    <!-- Column 1: Customer Name & Avatar -->
                    @if (isColVisible('customer')) {
                      <td [class]="cellPaddingClass">
                        <nexora-cell-customer [name]="row.name" [email]="row.email" />
                      </td>
                    }

                    <!-- Column 2: Status Badge -->
                    @if (isColVisible('status')) {
                      <td [class]="cellPaddingClass">
                        <nexora-cell-status-badge [status]="row.status" />
                      </td>
                    }

                    <!-- Column 3: Industry -->
                    @if (isColVisible('industry')) {
                      <td [class]="cellPaddingClass">
                        <span class="font-medium text-[#101828]">{{ row.industry }}</span>
                      </td>
                    }

                    <!-- Column 4: Country -->
                    @if (isColVisible('country')) {
                      <td [class]="cellPaddingClass">
                        <span class="inline-flex items-center gap-1.5 text-[#344054]">
                          <span>{{ row.flag }}</span>
                          <span>{{ row.country }}</span>
                        </span>
                      </td>
                    }

                    <!-- Column 5: Created Date -->
                    @if (isColVisible('createdDate')) {
                      <td [class]="cellPaddingClass">
                        <span class="text-[#667085]">{{ row.createdDate }}</span>
                      </td>
                    }

                    <!-- Column 6: Revenue & Growth -->
                    @if (isColVisible('revenue')) {
                      <td [class]="cellPaddingClass">
                        <nexora-cell-revenue [amount]="row.revenue" [growthPercent]="row.growth" />
                      </td>
                    }

                    <!-- Column 7: Health Score Progress -->
                    @if (isColVisible('health')) {
                      <td [class]="cellPaddingClass">
                        <nexora-cell-health-progress [value]="row.health" />
                      </td>
                    }

                    <!-- Column 8: Tags / Pods -->
                    @if (isColVisible('tags')) {
                      <td [class]="cellPaddingClass">
                        <nexora-cell-tags-group [tags]="row.tags" />
                      </td>
                    }

                    <!-- Column 9: Dedicated Rep -->
                    @if (isColVisible('rep')) {
                      <td [class]="cellPaddingClass">
                        <span class="text-[#344054] font-medium">{{ row.dedicatedRep }}</span>
                      </td>
                    }

                    <!-- Row Actions Dropdown Menu -->
                    <td [class]="cellPaddingClass" class="text-right">
                      <nexora-cell-actions-dropdown (actionSelect)="onRowAction(row, $event)" />
                    </td>
                  </tr>

                  <!-- Collapsible Row Detail Drawer (If expanded) -->
                  @if (isRowExpanded(row.id)) {
                    <tr
                      nexora-master-table-row-detail
                      [accountName]="row.name"
                      [accountId]="row.id"
                      [dedicatedRep]="row.dedicatedRep"
                    ></tr>
                  }
                }
              </tbody>

              <!-- Table Footer Aggregate Summary -->
              <nexora-master-table-footer
                [rowCount]="filteredData.length"
                [totalRevenue]="aggregateTotalRevenue"
                [activeCount]="aggregateActiveCount"
              />
            </table>
          }
        </div>

        <!-- 6. Pagination Section -->
        <nexora-master-table-pagination
          [currentPage]="currentPage"
          [pageSize]="pageSize"
          [totalItems]="filteredData.length"
          (pageChange)="currentPage = $event"
          (pageSizeChange)="pageSize = $event"
        />

      </div>
    </div>
  `
})
export class NexoraMasterTableComponent implements OnInit {
  @Input() title = 'Enterprise Customers Directory';
  @Input() description = 'Unified master registry of enterprise client contracts, tier classifications, and financial accruals.';

  @Output() actionTriggered = new EventEmitter<string>();

  // Fullscreen state
  isFullscreen = false;

  // Loading & Error states for demonstration
  isLoading = false;
  isError = false;

  // Density & layout
  density: TableDensity = 'regular';
  showFilterBar = true;

  // Search & Filters
  searchQuery = '';
  activeTabId = 'all';
  filters: TableFilterCriteria = {
    status: '',
    industry: '',
    country: '',
    minRevenue: null
  };

  // Pagination
  currentPage = 1;
  pageSize = 5;

  // Selection & Expansion
  selectedRowIds = new Set<string>();
  expandedRowIds = new Set<string>();

  // Header Tabs
  headerTabs: HeaderTab[] = [
    { id: 'all', label: 'All Accounts', count: 12 },
    { id: 'active', label: 'Active', count: 7 },
    { id: 'pending', label: 'Pending', count: 3 },
    { id: 'suspended', label: 'Suspended', count: 2 }
  ];

  // Column Definitions
  columns: TableColumnHeader[] = [
    { key: 'customer', label: 'Customer Account', sortable: true, width: '220px', visible: true },
    { key: 'status', label: 'Status', sortable: true, width: '130px', visible: true },
    { key: 'industry', label: 'Industry', sortable: true, width: '130px', visible: true },
    { key: 'country', label: 'Country', sortable: true, width: '140px', visible: true },
    { key: 'createdDate', label: 'Created Date', sortable: true, width: '120px', visible: true },
    { key: 'revenue', label: 'ARR Revenue', sortable: true, width: '160px', visible: true },
    { key: 'health', label: 'Account Health', sortable: true, width: '150px', visible: true },
    { key: 'tags', label: 'Service Pods', sortable: false, width: '160px', visible: true },
    { key: 'rep', label: 'Owner Rep', sortable: true, width: '140px', visible: true }
  ];

  columnVisibility: ColumnVisibilityItem[] = [];

  // 12 Rich Enterprise Customer Records
  rawData: EnterpriseCustomer[] = [
    {
      id: 'ACC-101',
      name: 'Acme Corporation',
      email: 'finance@acme.com',
      status: 'Active',
      industry: 'Fintech',
      country: 'India',
      flag: '🇮🇳',
      createdDate: '12 Sep 2026',
      revenue: 50000000,
      growth: 14.8,
      health: 94,
      tags: ['Tier-1', 'PCI-DSS', 'High ARR'],
      dedicatedRep: 'Rohan Tandel'
    },
    {
      id: 'ACC-102',
      name: 'Globex Holdings',
      email: 'ops@globex.de',
      status: 'Pending',
      industry: 'SaaS',
      country: 'Germany',
      flag: '🇩🇪',
      createdDate: '14 Sep 2026',
      revenue: 23000000,
      growth: 8.2,
      health: 68,
      tags: ['GDPR', 'EMEA Pod'],
      dedicatedRep: 'Sarah Connor'
    },
    {
      id: 'ACC-103',
      name: 'Umbrella Biosystems',
      email: 'contact@umbrella.us',
      status: 'Active',
      industry: 'Healthcare',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '16 Sep 2026',
      revenue: 12000000,
      growth: -2.1,
      health: 82,
      tags: ['HIPAA', 'Priority SLA'],
      dedicatedRep: 'Michael Kim'
    },
    {
      id: 'ACC-104',
      name: 'Stark Industries',
      email: 'admin@stark.com',
      status: 'Active',
      industry: 'Manufacturing',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '10 Sep 2026',
      revenue: 85000000,
      growth: 28.4,
      health: 98,
      tags: ['Defense', 'Tier-1', 'Global'],
      dedicatedRep: 'Tony Stark'
    },
    {
      id: 'ACC-105',
      name: 'Wayne Enterprises',
      email: 'procurement@wayne.uk',
      status: 'Active',
      industry: 'Energy',
      country: 'UK',
      flag: '🇬🇧',
      createdDate: '08 Sep 2026',
      revenue: 34000000,
      growth: 5.6,
      health: 88,
      tags: ['ISO-27001', 'Green Energy'],
      dedicatedRep: 'Bruce Wayne'
    },
    {
      id: 'ACC-106',
      name: 'Cyberdyne Systems',
      email: 'neural@cyberdyne.jp',
      status: 'Suspended',
      industry: 'Fintech',
      country: 'Germany',
      flag: '🇩🇪',
      createdDate: '02 Sep 2026',
      revenue: 9500000,
      growth: -12.4,
      health: 32,
      tags: ['Audit Flagged', 'KYC Overdue'],
      dedicatedRep: 'Miles Dyson'
    },
    {
      id: 'ACC-107',
      name: 'Initech Software',
      email: 'peter@initech.com',
      status: 'Active',
      industry: 'SaaS',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '18 Aug 2026',
      revenue: 8400000,
      growth: 4.1,
      health: 79,
      tags: ['Standard SLA'],
      dedicatedRep: 'Peter Gibbons'
    },
    {
      id: 'ACC-108',
      name: 'Hooli Cloud Corp',
      email: 'gavin@hooli.com',
      status: 'Pending',
      industry: 'SaaS',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '24 Aug 2026',
      revenue: 42000000,
      growth: 19.3,
      health: 72,
      tags: ['Multi-Cloud', 'Enterprise Pod'],
      dedicatedRep: 'Gavin Belson'
    },
    {
      id: 'ACC-109',
      name: 'Pied Piper Networks',
      email: 'richard@piedpiper.com',
      status: 'Active',
      industry: 'Fintech',
      country: 'Singapore',
      flag: '🇸🇬',
      createdDate: '30 Aug 2026',
      revenue: 16500000,
      growth: 34.0,
      health: 91,
      tags: ['Compression', 'Fast Growth'],
      dedicatedRep: 'Richard Hendricks'
    },
    {
      id: 'ACC-110',
      name: 'Oscorp Chemical',
      email: 'norman@oscorp.com',
      status: 'Suspended',
      industry: 'Healthcare',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '15 Jul 2026',
      revenue: 6800000,
      growth: -8.5,
      health: 44,
      tags: ['Restricted', 'Legal Hold'],
      dedicatedRep: 'Norman Osborn'
    },
    {
      id: 'ACC-111',
      name: 'Wonka Confections',
      email: 'willy@wonka.uk',
      status: 'Active',
      industry: 'Manufacturing',
      country: 'UK',
      flag: '🇬🇧',
      createdDate: '01 Jul 2026',
      revenue: 29000000,
      growth: 11.2,
      health: 86,
      tags: ['Direct Debit', 'Tier-2'],
      dedicatedRep: 'Charlie Bucket'
    },
    {
      id: 'ACC-112',
      name: 'Massive Dynamic Labs',
      email: 'nina@massivedynamic.com',
      status: 'Pending',
      industry: 'Healthcare',
      country: 'Singapore',
      flag: '🇸🇬',
      createdDate: '19 Jun 2026',
      revenue: 18400000,
      growth: 3.7,
      health: 70,
      tags: ['Clinical Trial', 'Asia-Pac'],
      dedicatedRep: 'Nina Sharp'
    }
  ];

  ngOnInit() {
    this.columnVisibility = this.columns.map(c => ({
      key: c.key,
      label: c.label,
      visible: c.visible !== false
    }));
  }

  // Cell padding class based on density
  get cellPaddingClass(): string {
    switch (this.density) {
      case 'compact': return 'px-4 py-2';
      case 'comfortable': return 'px-4 py-5';
      case 'regular':
      default: return 'px-4 py-3.5';
    }
  }

  isColVisible(key: string): boolean {
    const col = this.columnVisibility.find(c => c.key === key);
    return col ? col.visible : true;
  }

  // Filtered & Sorted Dataset
  get filteredData(): EnterpriseCustomer[] {
    return this.rawData.filter(row => {
      // 1. Tab filter
      if (this.activeTabId !== 'all') {
        if (row.status.toLowerCase() !== this.activeTabId.toLowerCase()) return false;
      }

      // 2. Search query filter
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matches =
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.country.toLowerCase().includes(q) ||
          row.industry.toLowerCase().includes(q) ||
          row.dedicatedRep.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 3. Quick filters
      if (this.filters.status && row.status !== this.filters.status) return false;
      if (this.filters.industry && row.industry !== this.filters.industry) return false;
      if (this.filters.country && row.country !== this.filters.country) return false;
      if (this.filters.minRevenue !== null && row.revenue < this.filters.minRevenue) return false;

      return true;
    });
  }

  get paginatedData(): EnterpriseCustomer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  // Aggregate stats
  get aggregateTotalRevenue(): number {
    return this.filteredData.reduce((acc, row) => acc + row.revenue, 0);
  }

  get aggregateActiveCount(): number {
    return this.filteredData.filter(r => r.status === 'Active').length;
  }

  get activeFilterCount(): number {
    let c = 0;
    if (this.filters.status) c++;
    if (this.filters.industry) c++;
    if (this.filters.country) c++;
    if (this.filters.minRevenue !== null) c++;
    return c;
  }

  // Selection helpers
  isRowSelected(id: string): boolean {
    return this.selectedRowIds.has(id);
  }

  isRowExpanded(id: string): boolean {
    return this.expandedRowIds.has(id);
  }

  get isAllPageSelected(): boolean {
    if (this.paginatedData.length === 0) return false;
    return this.paginatedData.every(r => this.selectedRowIds.has(r.id));
  }

  get isIndeterminate(): boolean {
    const selectedInPage = this.paginatedData.filter(r => this.selectedRowIds.has(r.id)).length;
    return selectedInPage > 0 && selectedInPage < this.paginatedData.length;
  }

  onSelectAllOnPage(checked: boolean) {
    if (checked) {
      this.paginatedData.forEach(r => this.selectedRowIds.add(r.id));
    } else {
      this.paginatedData.forEach(r => this.selectedRowIds.delete(r.id));
    }
  }

  selectAllGlobal() {
    this.filteredData.forEach(r => this.selectedRowIds.add(r.id));
  }

  deselectAll() {
    this.selectedRowIds.clear();
  }

  onRowSelectChange(id: string, checked: boolean) {
    if (checked) {
      this.selectedRowIds.add(id);
    } else {
      this.selectedRowIds.delete(id);
    }
  }

  onRowExpandChange(id: string, expanded: boolean) {
    if (expanded) {
      this.expandedRowIds.add(id);
    } else {
      this.expandedRowIds.delete(id);
    }
  }

  // Handlers
  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    this.currentPage = 1;
    this.actionTriggered.emit(`Selected Tab: ${tabId}`);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
  }

  onFilterChange(f: TableFilterCriteria) {
    this.filters = { ...f };
    this.currentPage = 1;
  }

  onFilterReset() {
    this.filters = { status: '', industry: '', country: '', minRevenue: null };
    this.currentPage = 1;
  }

  resetAllFilters() {
    this.searchQuery = '';
    this.activeTabId = 'all';
    this.onFilterReset();
  }

  onColumnVisibilityChange(cols: ColumnVisibilityItem[]) {
    this.columnVisibility = [...cols];
    this.actionTriggered.emit(`Column layout adjusted (${cols.filter(c => c.visible).length} visible)`);
  }

  onSortChange(event: { key: string; direction: 'asc' | 'desc' | null }) {
    if (!event.direction) {
      // Revert to original order
      return;
    }
    this.rawData.sort((a: any, b: any) => {
      const valA = a[event.key];
      const valB = b[event.key];
      if (valA < valB) return event.direction === 'asc' ? -1 : 1;
      if (valA > valB) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });
    this.actionTriggered.emit(`Sorted by ${event.key} (${event.direction.toUpperCase()})`);
  }

  onAutoRefreshToggle(on: boolean) {
    this.actionTriggered.emit(`Auto-refresh ${on ? 'ENABLED (every 15s)' : 'DISABLED'}`);
  }

  onExport(format: string) {
    this.actionTriggered.emit(`Exporting ${this.filteredData.length} records as ${format.toUpperCase()}`);
  }

  onBulkAction(action: string) {
    this.actionTriggered.emit(`Bulk action "${action}" executed on ${this.selectedRowIds.size} rows`);
  }

  onRowAction(row: EnterpriseCustomer, action: string) {
    this.actionTriggered.emit(`Row action "${action}" on ${row.name} (${row.id})`);
  }

  onPrimaryAction() {
    this.actionTriggered.emit('Primary CTA clicked: + Add Customer Account');
  }

  onSecondaryAction() {
    this.actionTriggered.emit('Secondary CTA clicked: Import Accounts');
  }

  onRetry() {
    this.isError = false;
    this.isLoading = true;
    setTimeout(() => this.isLoading = false, 800);
  }
}
