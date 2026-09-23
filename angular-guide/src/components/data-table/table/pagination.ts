import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import type { PaginationState } from '../models/column-def.model';

/**
 * Pagination — table footer pagination strip.
 *
 * TABLE level · rendered below the scrollable table body.
 *
 * Layout:
 *   Left  — "Showing X–Y of Z results"
 *   Center — « ‹ 1 2 3 … N › »  (window of 5 pages, disabled at boundaries)
 *   Right  — "Rows per page" selector
 *
 * Rules:
 *   • First/prev arrows disabled when on page 1.
 *   • Last/next arrows disabled when on last page.
 *   • Ellipsis shown when total pages > 7.
 *   • Page size change resets to page 1.
 */
@Component({
  selector: 'dt-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex items-center justify-between border-t border-slate-200 px-5 py-3">

    <!-- Left: range info -->
    <div class="text-xs text-slate-500 min-w-[160px]">
      Showing
      <span class="font-medium text-slate-700">{{ rangeFrom }}–{{ rangeTo }}</span>
      of
      <span class="font-medium text-slate-700">{{ state.total | number }}</span>
      results
    </div>

    <!-- Center: page buttons -->
    <div class="flex items-center gap-0.5">

      <!-- First -->
      <button type="button" class="pg-btn"
        [disabled]="state.page === 1"
        [class.opacity-30]="state.page === 1"
        title="First page"
        (click)="state.page > 1 && go(1)">«</button>

      <!-- Prev -->
      <button type="button" class="pg-btn"
        [disabled]="state.page === 1"
        [class.opacity-30]="state.page === 1"
        title="Previous page"
        (click)="state.page > 1 && go(state.page - 1)">‹</button>

      <ng-container *ngFor="let p of pageWindow">
        <span *ngIf="p === -1" class="px-1 text-xs text-slate-400">…</span>
        <button *ngIf="p !== -1"
          type="button"
          class="pg-btn"
          [class.pg-active]="p === state.page"
          (click)="go(p)">{{ p }}</button>
      </ng-container>

      <!-- Next -->
      <button type="button" class="pg-btn"
        [disabled]="state.page >= state.totalPages"
        [class.opacity-30]="state.page >= state.totalPages"
        title="Next page"
        (click)="state.page < state.totalPages && go(state.page + 1)">›</button>

      <!-- Last -->
      <button type="button" class="pg-btn"
        [disabled]="state.page >= state.totalPages"
        [class.opacity-30]="state.page >= state.totalPages"
        title="Last page"
        (click)="state.page < state.totalPages && go(state.totalPages)">»</button>

    </div>

    <!-- Right: rows per page -->
    <div class="flex items-center gap-2 min-w-[160px] justify-end">
      <span class="text-xs text-slate-500">Rows per page</span>
      <div class="relative" (click)="$event.stopPropagation()">
        <button type="button"
          class="flex h-8 items-center gap-3 rounded-md border border-slate-200
                 bg-white px-3 text-xs text-slate-600 hover:border-slate-300 transition-colors"
          (click)="pageSizeOpen = !pageSizeOpen">
          {{ state.limit }}
          <span class="text-[9px]">⌄</span>
        </button>
        <div *ngIf="pageSizeOpen"
          class="absolute bottom-full right-0 mb-1 z-50 min-w-[100px] rounded-lg
                 border border-slate-200 bg-white p-1.5 shadow-xl">
          <div class="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase
                      tracking-wide text-slate-400">Rows</div>
          <button *ngFor="let s of pageSizeOptions" type="button"
            class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5
                   text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
            (click)="changePageSize(s); pageSizeOpen = false">
            <span class="w-4 text-[#436CF3]">{{ s === state.limit ? '✓' : '' }}</span>
            {{ s }}
          </button>
        </div>
      </div>
    </div>

  </div>
  `,
  styles: [`
    :host { display: block; }
    .pg-btn {
      @apply inline-flex h-8 min-w-[32px] items-center justify-center rounded-md
             px-2 text-[11px] text-slate-500 transition-colors hover:bg-slate-100;
    }
    .pg-active {
      @apply bg-[#436CF3] text-white hover:bg-[#436CF3];
    }
  `],
})
export class TablePagination {
  @Input() state: PaginationState = { page: 1, limit: 25, total: 0, totalPages: 1 };
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  @Output() pageChange     = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeOpen = false;

  get rangeFrom(): number {
    return Math.min((this.state.page - 1) * this.state.limit + 1, this.state.total);
  }
  get rangeTo(): number {
    return Math.min(this.state.page * this.state.limit, this.state.total);
  }

  /** Builds the visible page window: [1, -1(ellipsis), 4,5,6, -1, 20] */
  get pageWindow(): number[] {
    const { page, totalPages: tp } = this.state;
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (page > 3) pages.push(-1);

    const start = Math.max(2, page - 1);
    const end   = Math.min(tp - 1, page + 1);
    for (let p = start; p <= end; p++) pages.push(p);

    if (page < tp - 2) pages.push(-1);
    pages.push(tp);
    return pages;
  }

  go(page: number): void {
    if (page === this.state.page) return;
    this.pageChange.emit(page);
  }

  changePageSize(size: number): void {
    if (size === this.state.limit) return;
    this.pageSizeChange.emit(size);
  }

  @HostListener('document:click')
  onDocClick(): void { this.pageSizeOpen = false; }
}
