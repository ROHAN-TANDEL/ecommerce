import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-master-table-empty',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-16 px-6 text-center flex flex-col items-center justify-center bg-white">
      <div class="w-14 h-14 rounded-full bg-[#EFF4FF] flex items-center justify-center text-[#436CF3] text-2xl mb-3 shadow-2xs">
        🔍
      </div>
      <h3 class="text-sm font-bold text-[#101828] mb-1">{{ title }}</h3>
      <p class="text-xs text-[#667085] max-w-sm mb-5">{{ message }}</p>

      @if (showReset) {
        <button
          type="button"
          (click)="reset.emit()"
          class="px-3.5 py-2 text-xs font-semibold text-[#436CF3] bg-[#EFF4FF] hover:bg-[#D1E0FF] rounded-lg transition-colors cursor-pointer"
        >
          {{ resetLabel }}
        </button>
      }
    </div>
  `
})
export class MasterTableEmptyComponent {
  @Input() title = 'No records found';
  @Input() message = 'No customers matched your current filter or search criteria. Try clearing active filters.';
  @Input() showReset = true;
  @Input() resetLabel = 'Clear all filters';
  @Output() reset = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-master-table-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-4 bg-white">
      <div class="flex items-center justify-between animate-pulse">
        <div class="h-4 bg-[#F2F4F7] rounded w-1/4"></div>
        <div class="h-4 bg-[#F2F4F7] rounded w-1/6"></div>
      </div>
      @for (item of [1, 2, 3, 4, 5]; track item) {
        <div class="flex items-center gap-4 py-3 border-b border-[#F2F4F7] animate-pulse">
          <div class="w-4 h-4 bg-[#F2F4F7] rounded"></div>
          <div class="w-8 h-8 bg-[#F2F4F7] rounded-full"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3.5 bg-[#F2F4F7] rounded w-1/3"></div>
            <div class="h-3 bg-[#F2F4F7] rounded w-1/5"></div>
          </div>
          <div class="h-4 bg-[#F2F4F7] rounded w-20"></div>
          <div class="h-4 bg-[#F2F4F7] rounded w-28"></div>
          <div class="h-4 bg-[#F2F4F7] rounded w-16"></div>
        </div>
      }
    </div>
  `
})
export class MasterTableLoadingComponent {}

@Component({
  selector: 'nexora-master-table-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-12 px-6 text-center flex flex-col items-center justify-center bg-white">
      <div class="w-12 h-12 rounded-full bg-[#FEF3F2] flex items-center justify-center text-[#B42318] text-xl mb-3">
        ⚠️
      </div>
      <h3 class="text-sm font-bold text-[#101828] mb-1">{{ title }}</h3>
      <p class="text-xs text-[#667085] max-w-sm mb-4">{{ message }}</p>
      <button
        type="button"
        (click)="retry.emit()"
        class="px-3.5 py-2 text-xs font-semibold text-white bg-[#D92D20] hover:bg-[#B42318] rounded-lg transition-colors cursor-pointer"
      >
        Retry Query
      </button>
    </div>
  `
})
export class MasterTableErrorComponent {
  @Input() title = 'Failed to load dataset';
  @Input() message = 'A remote network or database timeout occurred while fetching customer records.';
  @Output() retry = new EventEmitter<void>();
}
