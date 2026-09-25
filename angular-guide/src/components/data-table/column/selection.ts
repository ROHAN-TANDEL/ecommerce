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
      class="w-[54px] bg-slate-50 px-3 align-middle text-left"
      [class.py-1.5]="density === 'compact'"
      [class.py-2.5]="density === 'comfortable'"
      [class.py-4]="density === 'spacious'"
      [class.sticky]="fixed"
      [class.left-0]="fixed"
      [class.z-30]="fixed"
      [class.border-r]="fixed"
      [class.border-r-slate-200]="fixed"
      [attr.aria-label]="allSelected ? 'Deselect all rows' : 'Select all rows'"
    >
      <!-- Matches the left inset used by the row-level checkboxes. -->
      <div class="flex items-center">

        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
          [checked]="allSelected"
          [indeterminate]="someSelected && !allSelected"
          (change)="masterChange.emit(!allSelected)"
          [attr.aria-label]="allSelected ? 'Deselect all' : 'Select all'"
        />

      </div>
    </th>
  `,
})
export class SelectionColumn {
  @Input() visible: boolean = true;
  @Input() fixed = false;
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Input() selectedCount: number = 0;
  @Input() totalCount: number = 0;
  @Output() masterChange = new EventEmitter<boolean>();

  get allSelected(): boolean { return this.totalCount > 0 && this.selectedCount === this.totalCount; }
  get someSelected(): boolean { return this.selectedCount > 0 && this.selectedCount < this.totalCount; }
}
