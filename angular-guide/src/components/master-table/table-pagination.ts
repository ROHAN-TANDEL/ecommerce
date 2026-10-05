import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-master-table-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-6 py-4 bg-white border-t border-[#EAECF0] rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
      <!-- Left: Item Range & Page Size -->
      <div class="flex items-center gap-4 text-[#667085]">
        <div>
          Showing
          <strong class="text-[#101828] font-semibold">{{ startItem }}</strong>
          to
          <strong class="text-[#101828] font-semibold">{{ endItem }}</strong>
          of
          <strong class="text-[#101828] font-semibold">{{ totalItems }}</strong>
          records
        </div>

        <div class="flex items-center gap-1.5 pl-4 border-l border-[#EAECF0]">
          <span>Rows per page:</span>
          <select
            [ngModel]="pageSize"
            (ngModelChange)="onPageSizeChange($event)"
            class="bg-white border border-[#D0D5DD] rounded-lg px-2 py-1 text-xs text-[#344054] focus:outline-none focus:border-[#436CF3] cursor-pointer"
          >
            @for (opt of pageSizeOptions; track opt) {
              <option [value]="opt">{{ opt }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Right: Pagination Buttons -->
      <div class="flex items-center gap-1">
        <!-- First Page Button -->
        <button
          type="button"
          (click)="goToPage(1)"
          [disabled]="currentPage <= 1"
          class="px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white text-[#344054] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="First page"
        >
          «
        </button>

        <!-- Previous Button -->
        <button
          type="button"
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage <= 1"
          class="px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white text-[#344054] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
        >
          Previous
        </button>

        <!-- Numeric Page Buttons -->
        @for (page of visiblePages; track page) {
          @if (page === -1) {
            <span class="px-2 text-[#98A2B3]">…</span>
          } @else {
            <button
              type="button"
              (click)="goToPage(page)"
              [class]="currentPage === page ? 'bg-[#436CF3] text-white font-bold border-[#436CF3]' : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] font-medium'"
              class="w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              {{ page }}
            </button>
          }
        }

        <!-- Next Button -->
        <button
          type="button"
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage >= totalPages"
          class="px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white text-[#344054] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
        >
          Next
        </button>

        <!-- Last Page Button -->
        <button
          type="button"
          (click)="goToPage(totalPages)"
          [disabled]="currentPage >= totalPages"
          class="px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] disabled:opacity-40 disabled:hover:bg-white text-[#344054] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Last page"
        >
          »
        </button>
      </div>
    </div>
  `
})
export class MasterTablePaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() pageSizeOptions = [5, 10, 25, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, -1, total];
    }

    if (current >= total - 2) {
      return [1, -1, total - 3, total - 2, total - 1, total];
    }

    return [1, -1, current - 1, current, current + 1, -1, total];
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages && p !== this.currentPage) {
      this.currentPage = p;
      this.pageChange.emit(p);
    }
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.pageSizeChange.emit(this.pageSize);
    this.pageChange.emit(1);
  }
}
