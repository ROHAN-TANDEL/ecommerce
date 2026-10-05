import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NexoraMasterTableComponent,
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
  MasterTableErrorComponent,
  TableColumnHeader,
  ColumnVisibilityItem,
  TableFilterCriteria
} from '../../../components/master-table';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NexoraMasterTableComponent,
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
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {
  // Navigation: Assembled Master Table vs. Modular Table Section Building Blocks
  viewMode: 'master-table' | 'table-sections' = 'master-table';

  // Active section for exploratory building blocks view
  activeSection:
    | 'header'
    | 'toolbar'
    | 'filter-bar'
    | 'selection-bar'
    | 'head'
    | 'row-states'
    | 'cells'
    | 'detail-drawer'
    | 'footer'
    | 'pagination'
    | 'states' = 'header';

  // Live Action Status Ticker
  lastActionMessage = 'Principal Master Table ready. Click actions to test.';

  // Section 1: Header playground
  sampleHeaderTab = 'all';

  // Section 2: Toolbar playground
  toolbarSearchQuery = '';
  toolbarDensity: 'compact' | 'regular' | 'comfortable' = 'regular';
  sampleColumns: ColumnVisibilityItem[] = [
    { key: 'customer', label: 'Customer Account', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'industry', label: 'Industry', visible: true },
    { key: 'country', label: 'Country', visible: true },
    { key: 'revenue', label: 'ARR Revenue', visible: true },
    { key: 'health', label: 'Health Score', visible: false }
  ];

  // Section 3: Filter Bar playground
  sampleFilters: TableFilterCriteria = {
    status: 'Active',
    industry: 'Fintech',
    country: '',
    minRevenue: 5000000
  };

  // Section 4: Selection Bar playground
  sampleSelectedCount = 3;

  // Section 5: Thead Column Headers playground
  sampleTheadColumns: TableColumnHeader[] = [
    { key: 'customer', label: 'Customer Account', sortable: true, sortDirection: 'asc', width: '220px' },
    { key: 'status', label: 'Status', sortable: true, sortDirection: null, width: '130px' },
    { key: 'revenue', label: 'ARR Revenue', sortable: true, sortDirection: 'desc', width: '160px' },
    { key: 'country', label: 'Country', sortable: false, width: '140px' }
  ];

  // Section 6: Row States playground
  isRow1Selected = false;
  isRow1Expanded = false;
  isRow2Selected = true;
  isRow2Expanded = false;
  isRow3Disabled = true;

  // Section 9: Pagination playground
  paginationCurrentPage = 2;
  paginationPageSize = 10;
  paginationTotalItems = 148;

  onFilterChangeLog(criteria: TableFilterCriteria) {
    this.logAction(`Filter changed: Status=${criteria.status || 'All'}, Industry=${criteria.industry || 'All'}, Revenue=${criteria.minRevenue ? '₹' + criteria.minRevenue.toLocaleString() : 'Any'}`);
  }

  logAction(msg: string) {
    this.lastActionMessage = `[${new Date().toLocaleTimeString()}] ${msg}`;
  }
}
