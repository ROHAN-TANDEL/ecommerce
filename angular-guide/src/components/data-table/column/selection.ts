import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Selection — Master-checkbox <th> for the selection column.
 *
 * COLUMN level (TABLE-scoped) · Property: selectable, multipleSelection
 *
 * Three visual states of the master checkbox:
 *   unchecked (0 rows selected), indeterminate (some), checked (all)
 * Shows a selected-count badge when > 0 rows are selected.
 *
 * Rules:
 *   • Selection state must remain visually distinguishable from hover state.
 *   • Editing state must remain visually distinguishable from selection state.
 * Constraints:
 *   • A hidden column must not occupy visible table space.
 */
@Component({
  selector: 'dt-col-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <th
      *ngIf="visible"
      class="w-[54px] bg-slate-50 px-3 py-2.5 align-middle text-left"
      [attr.aria-label]="allSelected ? 'Deselect all rows' : 'Select all rows'"
    >
      <div class="flex flex-col items-center gap-1">

        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
          [checked]="allSelected"
          [indeterminate]="someSelected && !allSelected"
          (change)="masterChange.emit(!allSelected)"
          [attr.aria-label]="allSelected ? 'Deselect all' : 'Select all'"
        />

        <span
          *ngIf="selectedCount > 0"
          class="inline-flex h-4 min-w-[16px] items-center justify-center
                 rounded-full bg-[#436CF3] px-1 text-[8px] font-bold text-white"
          [attr.aria-label]="selectedCount + ' rows selected'"
        >{{ selectedCount }}</span>

      </div>
    </th>
  `,
})
export class SelectionColumn {
  @Input() visible: boolean = true;
  @Input() selectedCount: number = 0;
  @Input() totalCount: number = 0;
  @Output() masterChange = new EventEmitter<boolean>();

  get allSelected(): boolean { return this.totalCount > 0 && this.selectedCount === this.totalCount; }
  get someSelected(): boolean { return this.selectedCount > 0 && this.selectedCount < this.totalCount; }
}
