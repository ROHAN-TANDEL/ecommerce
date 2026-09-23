import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';


@Component({
  selector: 'nexora-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table-test.html',
  styleUrl: './data-table-test.css'
})

export class DataTableTest {

  openMenu: string | null = null;
  activeFilter: string | null = null;

  selectedRows: string[] = [];
  editingRows: string[] = [];

  toggleRowSelection(row: any): void {
    if (this.selectedRows.includes(row.id)) {
      this.selectedRows = this.selectedRows.filter(id => id !== row.id);
    } else {
      this.selectedRows.push(row.id);
    }
  }

  editSelectedRows(): void {
    this.editingRows = this.rows
      .filter((row: any) => this.selectedRows.includes(row.id) && row.editable)
      .map((row: any) => row.id);
  }

  toggleMenu(menu: string, event?: Event): void {
    event?.stopPropagation();
    this.openMenu = this.openMenu === menu ? null : menu;
    this.activeFilter = null;
  }

  toggleFilter(filter: string, event?: Event): void {
    event?.stopPropagation();
    this.activeFilter = this.activeFilter === filter ? null : filter;
    this.openMenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.nexora-popup-anchor') &&
        !target?.closest('.nexora-popup')) {
      this.closeMenus();
    }
  }

  closeMenus(): void {
    this.openMenu = null;
    this.activeFilter = null;
  }

  columns: any = [
    {
      key: 'customerName',
      label: 'Customer Name',
      width: '220px',
      sortable: true,
      editable: true,
      filterType: 'text'
    },
    {
      key: 'email',
      label: 'Email',
      width: '240px',
      sortable: true,
      editable: true,
      filterType: 'text'
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      sortable: true,
      editable: true,
      filterType: 'select'
    },
    {
      key: 'industry',
      label: 'Industry',
      width: '160px',
      sortable: true,
      editable: false,
      filterType: 'select'
    },
    {
      key: 'country',
      label: 'Country',
      width: '160px',
      sortable: true,
      editable: false,
      filterType: 'select'
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      width: '160px',
      sortable: true,
      editable: false,
      filterType: 'date-range'
    },
    {
      key: 'revenue',
      label: 'Revenue',
      width: '150px',
      sortable: true,
      editable: false,
      filterType: 'number-range'
    },
    {
      key: 'owner',
      label: 'Owner',
      width: '170px',
      sortable: true,
      editable: true,
      filterType: 'select'
    }
  ];

  rows: any = [
    {
      id: 'C001',
      customerName: 'Acme Corp',
      email: 'acme@corp.com',
      status: 'Active',
      industry: 'Fintech',
      country: 'India',
      flag: '🇮🇳',
      createdDate: '12 Sep 2026',
      revenue: '₹50,000,000',
      owner: 'John Doe',
      ownerInitials: 'JD',
      ownerColor: 'bg-indigo-100 text-indigo-700',
      selectable: true,
      editable: true,
      deletable: true,
      enableable: false,
      disableable: true
    },
    {
      id: 'C002',
      customerName: 'Globex',
      email: 'info@globex.com',
      status: 'Pending',
      industry: 'SaaS',
      country: 'Germany',
      flag: '🇩🇪',
      createdDate: '14 Sep 2026',
      revenue: '€2,300,000',
      owner: 'Sarah Connor',
      ownerInitials: 'SC',
      ownerColor: 'bg-violet-100 text-violet-700',
      selectable: true,
      editable: true,
      deletable: true,
      enableable: true,
      disableable: false
    },
    {
      id: 'C003',
      customerName: 'Umbrella Inc',
      email: 'contact@umbrella.com',
      status: 'Active',
      industry: 'Healthcare',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '16 Sep 2026',
      revenue: '$1,200,000',
      owner: 'Michael Kim',
      ownerInitials: 'MK',
      ownerColor: 'bg-blue-100 text-blue-700',
      selectable: true,
      editable: false,
      deletable: false,
      enableable: false,
      disableable: true
    },
    {
      id: 'C004',
      customerName: 'Stark Industries',
      email: 'admin@stark.com',
      status: 'Pending',
      industry: 'Manufacturing',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '10 Sep 2026',
      revenue: '$5,600,000',
      owner: 'Tony Stark',
      ownerInitials: 'TS',
      ownerColor: 'bg-pink-100 text-pink-700',
      selectable: true,
      editable: true,
      deletable: true,
      enableable: true,
      disableable: false
    },
    {
      id: 'C005',
      customerName: 'Wayne Corp',
      email: 'wayne@corp.com',
      status: 'Active',
      industry: 'Energy',
      country: 'UK',
      flag: '🇬🇧',
      createdDate: '08 Sep 2026',
      revenue: '£3,400,000',
      owner: 'Bruce Wayne',
      ownerInitials: 'BW',
      ownerColor: 'bg-blue-100 text-blue-700',
      selectable: true,
      editable: true,
      deletable: true,
      enableable: false,
      disableable: true
    },
    {
      id: 'C006',
      customerName: 'Oscorp',
      email: 'contact@oscorp.com',
      status: 'Disabled',
      industry: 'Biotech',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '05 Sep 2026',
      revenue: '$980,000',
      owner: 'Norman Osborn',
      ownerInitials: 'NO',
      ownerColor: 'bg-purple-100 text-purple-700',
      selectable: true,
      editable: false,
      deletable: false,
      enableable: true,
      disableable: false
    },
    {
      id: 'C007',
      customerName: 'Initech',
      email: 'hello@initech.com',
      status: 'Active',
      industry: 'IT Services',
      country: 'Canada',
      flag: '🇨🇦',
      createdDate: '01 Sep 2026',
      revenue: '$2,100,000',
      owner: 'Peter Gibbons',
      ownerInitials: 'PG',
      ownerColor: 'bg-emerald-100 text-emerald-700',
      selectable: true,
      editable: true,
      deletable: true,
      enableable: false,
      disableable: true
    },
    {
      id: 'C008',
      customerName: 'Hooli',
      email: 'info@hooli.com',
      status: 'Active',
      industry: 'Software',
      country: 'USA',
      flag: '🇺🇸',
      createdDate: '28 Aug 2026',
      revenue: '$7,500,000',
      owner: 'Richard Hendricks',
      ownerInitials: 'RH',
      ownerColor: 'bg-pink-100 text-pink-700',
      selectable: true,
      editable: true,
      deletable: true,
      enableable: false,
      disableable: true
    }
  ];
}
