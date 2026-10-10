import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between gap-4 py-2 text-xs text-[#344054]">
      <!-- Summary -->
      <div *ngIf="showSummary" class="text-[#667085]">
        Showing <span class="font-semibold text-[#101828]">{{ startItem }}</span> to
        <span class="font-semibold text-[#101828]">{{ endItem }}</span> of
        <span class="font-semibold text-[#101828]">{{ totalItems }}</span> results
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-1 ml-auto">
        <!-- Prev Button -->
        <button
          type="button"
          [disabled]="page <= 1"
          (click)="setPage(page - 1)"
          class="h-8 px-2.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] font-medium text-[#344054] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
          </svg>
          <span>Prev</span>
        </button>

        <!-- Page Numbers -->
        <button
          *ngFor="let p of pages"
          type="button"
          (click)="setPage(p)"
          class="w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
          [class.bg-[#436CF3]]="p === page"
          [class.text-white]="p === page"
          [class.shadow-xs]="p === page"
          [class.bg-white]="p !== page"
          [class.border]="p !== page"
          [class.border-[#D0D5DD]]="p !== page"
          [class.text-[#344054]]="p !== page"
          [class.hover:bg-[#F9FAFB]]="p !== page"
        >
          {{ p }}
        </button>

        <!-- Next Button -->
        <button
          type="button"
          [disabled]="page >= totalPages"
          (click)="setPage(page + 1)"
          class="h-8 px-2.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] font-medium text-[#344054] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs flex items-center gap-1"
        >
          <span>Next</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class NexoraPaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 100;
  @Input() showSummary = true;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    return (this.page - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  get pages(): number[] {
    const list: number[] = [];
    for (let i = 1; i <= Math.min(5, this.totalPages); i++) {
      list.push(i);
    }
    return list;
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      this.pageChange.emit(this.page);
    }
  }
}
