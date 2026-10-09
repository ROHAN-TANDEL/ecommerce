import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationState } from '../employees.types';

@Component({
  selector: 'pagination-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200 rounded-xl bg-white px-5 py-3 text-xs text-slate-600 shadow-2xs">

      <!-- Records Counter -->
      <div class="flex items-center gap-1.5">
        <span>Showing</span>
        <span class="font-medium text-slate-900">{{ currentCount === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1 }}</span>
        <span>to</span>
        <span class="font-medium text-slate-900">{{ (pagination.page - 1) * pagination.limit + currentCount }}</span>
        <span>of</span>
        <span class="font-medium text-slate-900">{{ pagination.total }}</span>
        <span>entries</span>
      </div>

      <!-- Page Jumpers -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          [disabled]="pagination.page <= 1"
          (click)="onPage(pagination.page - 1)"
          class="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          «
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-md bg-slate-900 text-white font-medium text-xs shadow-2xs"
        >
          {{ pagination.page }}
        </button>
        <button
          type="button"
          [disabled]="pagination.page >= pagination.totalPages"
          (click)="onPage(pagination.page + 1)"
          class="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          »
        </button>
      </div>

      <!-- Rows Per Page Selector -->
      <div class="flex items-center gap-2">
        <span class="text-slate-500">Rows per page:</span>
        <select
          (change)="onLimit(+$any($event.target).value)"
          class="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-900 shadow-2xs cursor-pointer"
        >
          <option *ngFor="let size of pageSizeOptions" [value]="size" [selected]="size === pagination.limit">
            {{ size }}
          </option>
        </select>
      </div>

    </footer>
  `,
})
export class PaginationComponent {
  @Input({ required: true }) pagination!: PaginationState;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() currentCount = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  onPage(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onLimit(limit: number): void {
    this.limitChange.emit(limit);
  }
}
