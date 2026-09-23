import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
}

interface TableRow {
  id: string;
  customer: string;
  customerCode: string;
  country: string;
  status: 'Active' | 'Pending' | 'Disabled';
  risk: 'Low' | 'Medium' | 'High';
  revenue: string;
  updated: string;
}

@Component({
  selector: 'nexora-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      <!-- ========================================================= -->
      <!-- Context Header -->
      <!-- ========================================================= -->

      <div class="border-b border-slate-200 px-5 py-4">

        <div class="flex items-center justify-between gap-4">

          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold text-slate-900">
                Customers
              </h2>

              <span
                class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#436CF3]"
              >
                12,482
              </span>
            </div>

            <p class="mt-1 text-xs text-slate-500">
              Manage customer records and account status
            </p>
          </div>

          <div class="flex items-center gap-2">

            <button
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span class="text-sm">↻</span>
              Refresh
            </button>

            <button
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-lg bg-[#436CF3] px-3 text-xs font-medium text-white transition hover:bg-[#365BD4]"
            >
              <span class="text-sm">+</span>
              Add Customer
            </button>

          </div>

        </div>

      </div>


      <!-- ========================================================= -->
      <!-- Toolbar -->
      <!-- ========================================================= -->

      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3">

        <div class="flex flex-wrap items-center gap-2">

          <!-- Search -->

          <div class="relative">
            <span
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search customers..."
              class="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#436CF3] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <!-- Filter -->

          <button
            type="button"
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <span>Filter</span>
            <span class="text-slate-400">⌄</span>
          </button>

          <!-- Sort -->

          <button
            type="button"
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <span>Sort</span>
            <span class="text-slate-400">⌄</span>
          </button>

        </div>


        <div class="flex items-center gap-2">

          <!-- Export -->

          <button
            type="button"
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Export
            <span class="text-slate-400">⌄</span>
          </button>

          <!-- Generate -->

          <button
            type="button"
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Generate
          </button>

          <!-- Download -->

          <button
            type="button"
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Download
            <span class="text-slate-400">⌄</span>
          </button>

          <!-- Columns -->

          <button
            type="button"
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <span>Columns</span>
          </button>

          <!-- More -->

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            aria-label="More actions"
          >
            ⋮
          </button>

        </div>

      </div>


      <!-- ========================================================= -->
      <!-- Active Filters -->
      <!-- ========================================================= -->

      <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5">

        <span class="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Filters
        </span>

        <span
          class="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-medium text-[#436CF3]"
        >
          Status: Active
          <button class="text-blue-400 hover:text-blue-600">×</button>
        </span>

        <span
          class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600"
        >
          Country: All
          <button class="text-slate-400 hover:text-slate-600">×</button>
        </span>

        <button
          type="button"
          class="ml-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
        >
          Clear all
        </button>

      </div>


      <!-- ========================================================= -->
      <!-- Table -->
      <!-- ========================================================= -->

      <div class="overflow-x-auto">

        <table class="min-w-[1200px] w-full border-collapse">

          <!-- Header -->

          <thead>

            <tr class="border-b border-slate-200 bg-slate-50">

              <!-- Selection -->

              <th class="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
                />
              </th>

              <!-- Columns -->

              <th
                *ngFor="let column of columns"
                class="whitespace-nowrap px-4 py-3 text-left"
                [style.width]="column.width"
              >
                <div class="flex items-center gap-2">

                  <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {{ column.label }}
                  </span>

                  <span
                    *ngIf="column.sortable"
                    class="text-[10px] text-slate-400"
                  >
                    ↕
                  </span>

                </div>
              </th>

              <!-- Actions -->

              <th class="w-36 px-4 py-3 text-right">
                <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </span>
              </th>

            </tr>

            <!-- Filter row -->

            <tr class="border-b border-slate-200 bg-white">

              <th class="px-4 py-2"></th>

              <th
                *ngFor="let column of columns"
                class="px-4 py-2"
              >
                <input
                  *ngIf="column.key !== 'status' && column.key !== 'risk'"
                  type="text"
                  class="h-7 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#436CF3] focus:bg-white"
                  [placeholder]="'Filter ' + column.label"
                />

                <button
                  *ngIf="column.key === 'status'"
                  type="button"
                  class="flex h-7 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-500"
                >
                  <span>All</span>
                  <span>⌄</span>
                </button>

                <button
                  *ngIf="column.key === 'risk'"
                  type="button"
                  class="flex h-7 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-500"
                >
                  <span>All</span>
                  <span>⌄</span>
                </button>
              </th>

              <th class="px-4 py-2"></th>

            </tr>

          </thead>


          <!-- ===================================================== -->
          <!-- Body -->
          <!-- ===================================================== -->

          <tbody>

            <tr
              *ngFor="let row of rows"
              class="group border-b border-slate-100 transition hover:bg-blue-50/30"
            >

              <!-- Checkbox -->

              <td class="px-4 py-3.5">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
                />
              </td>


              <!-- Customer -->

              <td class="px-4 py-3.5">

                <div class="flex items-center gap-3">

                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF1FF] text-xs font-semibold text-[#436CF3]"
                  >
                    {{ row.customer.charAt(0) }}
                  </div>

                  <div class="min-w-0">

                    <div class="truncate text-sm font-medium text-slate-800">
                      {{ row.customer }}
                    </div>

                    <div class="mt-0.5 text-[11px] text-slate-400">
                      {{ row.customerCode }}
                    </div>

                  </div>

                </div>

              </td>


              <!-- Country -->

              <td class="px-4 py-3.5">
                <span class="text-sm text-slate-600">
                  {{ row.country }}
                </span>
              </td>


              <!-- Status -->

              <td class="px-4 py-3.5">

                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-700': row.status === 'Active',
                    'bg-amber-50 text-amber-700': row.status === 'Pending',
                    'bg-slate-100 text-slate-500': row.status === 'Disabled'
                  }"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    [ngClass]="{
                      'bg-emerald-500': row.status === 'Active',
                      'bg-amber-500': row.status === 'Pending',
                      'bg-slate-400': row.status === 'Disabled'
                    }"
                  ></span>

                  {{ row.status }}
                </span>

              </td>


              <!-- Risk -->

              <td class="px-4 py-3.5">

                <span
                  class="text-xs font-medium"
                  [ngClass]="{
                    'text-emerald-600': row.risk === 'Low',
                    'text-amber-600': row.risk === 'Medium',
                    'text-red-600': row.risk === 'High'
                  }"
                >
                  {{ row.risk }}
                </span>

              </td>


              <!-- Revenue -->

              <td class="px-4 py-3.5">
                <span class="text-sm font-medium text-slate-700">
                  {{ row.revenue }}
                </span>
              </td>


              <!-- Updated -->

              <td class="px-4 py-3.5">
                <span class="text-xs text-slate-500">
                  {{ row.updated }}
                </span>
              </td>


              <!-- Actions -->

              <td class="px-4 py-3.5">

                <div class="flex items-center justify-end gap-1">

                  <button
                    type="button"
                    class="rounded-md p-1.5 text-slate-400 hover:bg-blue-50 hover:text-[#436CF3]"
                    title="Read"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="More actions"
                  >
                    ⋮
                  </button>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>


      <!-- ========================================================= -->
      <!-- Footer / Pagination -->
      <!-- ========================================================= -->

      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3">

        <div class="flex items-center gap-3">

          <span class="text-xs text-slate-500">
            Showing
            <span class="font-medium text-slate-700">1–10</span>
            of
            <span class="font-medium text-slate-700">12,482</span>
          </span>

          <button
            type="button"
            class="flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs text-slate-500 hover:bg-slate-50"
          >
            10 / page
            <span>⌄</span>
          </button>

        </div>


        <div class="flex items-center gap-1">

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            ‹
          </button>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md bg-[#436CF3] text-xs font-medium text-white"
          >
            1
          </button>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-slate-50"
          >
            2
          </button>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-slate-50"
          >
            3
          </button>

          <span class="px-1 text-xs text-slate-400">
            ...
          </span>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-xs text-slate-600 hover:bg-slate-50"
          >
            25
          </button>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            ›
          </button>

        </div>

      </div>

    </div>
  `

})
export class NexoraDataTableComponent {

  columns: TableColumn[] = [
    {
      key: 'customer',
      label: 'Customer',
      width: '260px',
      sortable: true
    },
    {
      key: 'country',
      label: 'Country',
      width: '150px',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      width: '150px',
      sortable: true
    },
    {
      key: 'risk',
      label: 'Risk',
      width: '130px',
      sortable: true
    },
    {
      key: 'revenue',
      label: 'Revenue',
      width: '150px',
      sortable: true
    },
    {
      key: 'updated',
      label: 'Last Updated',
      width: '170px',
      sortable: true
    }
  ];

  rows: TableRow[] = [
    {
      id: 'C001',
      customer: 'Acme Corporation',
      customerCode: 'CUS-0001',
      country: 'Germany',
      status: 'Active',
      risk: 'Low',
      revenue: '€2.4M',
      updated: 'Today, 10:42'
    },
    {
      id: 'C002',
      customer: 'Globex Industries',
      customerCode: 'CUS-0002',
      country: 'France',
      status: 'Pending',
      risk: 'Medium',
      revenue: '€1.8M',
      updated: 'Today, 09:18'
    },
    {
      id: 'C003',
      customer: 'Initech',
      customerCode: 'CUS-0003',
      country: 'United Kingdom',
      status: 'Disabled',
      risk: 'High',
      revenue: '€920K',
      updated: 'Yesterday, 16:32'
    },
    {
      id: 'C004',
      customer: 'Umbrella Corporation',
      customerCode: 'CUS-0004',
      country: 'United States',
      status: 'Active',
      risk: 'Low',
      revenue: '€4.1M',
      updated: 'Yesterday, 14:08'
    },
    {
      id: 'C005',
      customer: 'Stark Industries',
      customerCode: 'CUS-0005',
      country: 'United States',
      status: 'Pending',
      risk: 'Medium',
      revenue: '€3.7M',
      updated: 'Yesterday, 11:45'
    },
    {
      id: 'C006',
      customer: 'Wayne Enterprises',
      customerCode: 'CUS-0006',
      country: 'United Kingdom',
      status: 'Active',
      risk: 'Low',
      revenue: '€5.2M',
      updated: 'Sep 21, 15:21'
    },
    {
      id: 'C007',
      customer: 'Hooli',
      customerCode: 'CUS-0007',
      country: 'Germany',
      status: 'Active',
      risk: 'Medium',
      revenue: '€1.2M',
      updated: 'Sep 21, 12:06'
    },
    {
      id: 'C008',
      customer: 'Wonka Industries',
      customerCode: 'CUS-0008',
      country: 'France',
      status: 'Disabled',
      risk: 'High',
      revenue: '€680K',
      updated: 'Sep 20, 17:42'
    }
  ];

}
