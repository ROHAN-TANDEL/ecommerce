import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-master-table-selection-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (selectedCount > 0) {
      <div
        class="px-6 py-2.5 bg-[#101828] text-white flex flex-wrap items-center justify-between gap-3 text-xs select-none transition-all shadow-md animate-in fade-in slide-in-from-top-1"
      >
        <!-- Left: Selected Count & Global Select Link -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#436CF3] text-white text-[11px] font-bold flex items-center justify-center">
              {{ selectedCount }}
            </span>
            <span class="font-semibold text-slate-200">
              {{ selectedCount }} {{ selectedCount === 1 ? 'row' : 'rows' }} selected
            </span>
          </div>

          @if (totalCount !== undefined && selectedCount < totalCount) {
            <span class="text-slate-500">•</span>
            <button
              type="button"
              (click)="selectAllGlobal.emit()"
              class="text-[#84ADFF] hover:text-white underline underline-offset-2 cursor-pointer font-medium"
            >
              Select all {{ totalCount }} records across all pages
            </button>
          }
        </div>

        <!-- Right: Bulk Actions & Deselect -->
        <div class="flex items-center gap-2">
          <!-- Bulk Update Status -->
          <button
            type="button"
            (click)="bulkStatus.emit()"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Update Status</span>
          </button>

          <!-- Bulk Assign Owner -->
          <button
            type="button"
            (click)="bulkAssign.emit()"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
          >
            <span>👤</span>
            <span>Assign Owner</span>
          </button>

          <!-- Bulk Export -->
          <button
            type="button"
            (click)="bulkExport.emit()"
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Export ({{ selectedCount }})</span>
          </button>

          <!-- Bulk Delete -->
          <button
            type="button"
            (click)="bulkDelete.emit()"
            class="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-semibold transition-colors cursor-pointer border border-rose-500 flex items-center gap-1.5 shadow-xs"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>

          <!-- Deselect Button -->
          <button
            type="button"
            (click)="deselectAll.emit()"
            class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
            title="Deselect all rows"
          >
            ✕
          </button>
        </div>
      </div>
    }
  `
})
export class MasterTableSelectionBarComponent {
  @Input() selectedCount = 0;
  @Input() totalCount?: number;

  @Output() selectAllGlobal = new EventEmitter<void>();
  @Output() bulkStatus = new EventEmitter<void>();
  @Output() bulkAssign = new EventEmitter<void>();
  @Output() bulkExport = new EventEmitter<void>();
  @Output() bulkDelete = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
}
