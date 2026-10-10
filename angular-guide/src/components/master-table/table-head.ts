import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumnHeader {
  key: string;
  label: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  width?: string;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right';
  visible?: boolean;
}

@Component({
  selector: 'nexora-master-table-head',
  standalone: true,
  imports: [CommonModule],
  template: `
    <thead class="bg-[#F9FAFB] border-b border-[#EAECF0] text-xs font-semibold text-[#475467] uppercase tracking-wider select-none">
      <tr>
        <!-- Expand Column Th -->
        @if (showExpand) {
          <th class="w-10 px-3 py-3 text-center"></th>
        }

        <!-- Checkbox Selection Th -->
        @if (showSelection) {
          <th class="w-12 px-4 py-3 text-left">
            <input
              type="checkbox"
              [checked]="allSelected"
              [indeterminate]="isIndeterminate"
              (change)="onSelectAllToggle($event)"
              class="w-4 h-4 rounded border-[#D0D5DD] text-[#436CF3] focus:ring-[#436CF3] cursor-pointer"
              title="Select all on this page"
            />
          </th>
        }

        <!-- Dynamic Column Headers -->
        @for (col of visibleColumns; track col.key; let idx = $index) {
          <th
            [style.width]="col.width"
            [class.text-left]="!col.align || col.align === 'left'"
            [class.text-center]="col.align === 'center'"
            [class.text-right]="col.align === 'right'"
            class="px-4 py-3 font-semibold whitespace-nowrap group hover:bg-[#F2F4F7] transition-colors relative"
          >
            <div
              class="inline-flex items-center gap-1.5 cursor-pointer"
              [class.cursor-pointer]="col.sortable !== false"
              (click)="onSort(col)"
            >
              <span>{{ col.label }}</span>

              <!-- Sort Indicator -->
              @if (col.sortable !== false) {
                <span class="text-[11px] font-sans">
                  @if (col.sortDirection === 'asc') {
                    <span class="text-[#436CF3] font-bold">▲</span>
                  } @else if (col.sortDirection === 'desc') {
                    <span class="text-[#436CF3] font-bold">▼</span>
                  } @else {
                    <span class="text-[#D0D5DD] group-hover:text-[#98A2B3]">↕</span>
                  }
                </span>
              }

              <!-- Pin Indicator -->
              @if (col.pinned) {
                <span class="text-[10px] text-[#436CF3]" title="Column pinned">📌</span>
              }
            </div>

            <!-- Resizer Handle Bar -->
            <div class="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-[#D0D5DD] opacity-50 group-hover:opacity-100"></div>
          </th>
        }

        <!-- Actions Menu Th -->
        @if (showRowActions) {
          <th class="w-16 px-4 py-3 text-right">
            <span class="sr-only">Actions</span>
          </th>
        }
      </tr>
    </thead>
  `
})
export class MasterTableHeadComponent {
  @Input() columns: TableColumnHeader[] = [];
  @Input() allSelected = false;
  @Input() isIndeterminate = false;
  @Input() showSelection = true;
  @Input() showExpand = true;
  @Input() showRowActions = true;

  @Output() selectAllChange = new EventEmitter<boolean>();
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' | null }>();

  get visibleColumns(): TableColumnHeader[] {
    return this.columns.filter(c => c.visible !== false);
  }

  onSelectAllToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAllChange.emit(checked);
  }

  onSort(col: TableColumnHeader) {
    if (col.sortable === false) return;

    let nextDirection: 'asc' | 'desc' | null = 'asc';
    if (col.sortDirection === 'asc') {
      nextDirection = 'desc';
    } else if (col.sortDirection === 'desc') {
      nextDirection = null;
    }

    col.sortDirection = nextDirection;
    this.sortChange.emit({ key: col.key, direction: nextDirection });
  }
}
