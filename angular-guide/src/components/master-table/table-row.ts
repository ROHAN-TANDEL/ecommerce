import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tr[nexora-master-table-row]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Expand Toggle Cell -->
    @if (showExpand) {
      <td class="w-10 px-3 py-3 text-center">
        <button
          type="button"
          (click)="onToggleExpand($event)"
          class="w-6 h-6 rounded-md hover:bg-[#F2F4F7] text-[#667085] hover:text-[#101828] transition-transform text-xs cursor-pointer inline-flex items-center justify-center"
          [class.rotate-90]="isExpanded"
          title="Toggle row details"
        >
          ▶
        </button>
      </td>
    }

    <!-- Selection Checkbox Cell -->
    @if (showSelection) {
      <td class="w-12 px-4 py-3 text-left">
        <input
          type="checkbox"
          [checked]="isSelected"
          (change)="onSelectToggle($event)"
          (click)="$event.stopPropagation()"
          class="w-4 h-4 rounded border-[#D0D5DD] text-[#436CF3] focus:ring-[#436CF3] cursor-pointer"
        />
      </td>
    }

    <!-- Projected Cells Content -->
    <ng-content></ng-content>
  `,
  host: {
    '[class.bg-white]': '!isSelected && !isHovered',
    '[class.bg-[#EFF4FF]/60]': 'isSelected',
    '[class.border-b]': 'true',
    '[class.border-[#EAECF0]]': 'true',
    '[class.hover:bg-[#F9FAFB]]': '!isSelected',
    '[class.opacity-60]': 'isDisabled',
    '[class.cursor-not-allowed]': 'isDisabled',
    'class': 'transition-colors select-none text-xs text-[#344054]'
  }
})
export class MasterTableRowComponent {
  @Input() isSelected = false;
  @Input() isExpanded = false;
  @Input() isDisabled = false;
  @Input() isHovered = false;
  @Input() showSelection = true;
  @Input() showExpand = true;
  @Input() rowId = '';

  @Output() selectChange = new EventEmitter<boolean>();
  @Output() expandChange = new EventEmitter<boolean>();

  onSelectToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isSelected = checked;
    this.selectChange.emit(checked);
  }

  onToggleExpand(event: MouseEvent) {
    event.stopPropagation();
    this.isExpanded = !this.isExpanded;
    this.expandChange.emit(this.isExpanded);
  }
}
