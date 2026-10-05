import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-master-table-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <tfoot class="bg-[#F9FAFB] border-t-2 border-[#EAECF0] text-xs font-semibold text-[#101828] select-none">
      <tr>
        <!-- Expand Th placeholder -->
        @if (showExpand) {
          <td class="w-10 px-3 py-3 text-center"></td>
        }

        <!-- Checkbox Th placeholder -->
        @if (showSelection) {
          <td class="w-12 px-4 py-3 text-left"></td>
        }

        <!-- Label Cell -->
        <td class="px-4 py-3 font-bold uppercase tracking-wider text-[#475467]">
          <span>Aggregate Summary ({{ rowCount }} Rows)</span>
        </td>

        <td class="px-4 py-3 text-[#667085]">
          <span>—</span>
        </td>

        <!-- Status Column Summary -->
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1 text-[#027A48] font-bold">
            <span>●</span> {{ activeCount }} Active
          </span>
        </td>

        <td class="px-4 py-3 text-[#667085]">
          <span>—</span>
        </td>

        <td class="px-4 py-3 text-[#667085]">
          <span>—</span>
        </td>

        <td class="px-4 py-3 text-[#667085]">
          <span>—</span>
        </td>

        <!-- Total Revenue Summary -->
        <td class="px-4 py-3 font-mono font-bold text-[#101828]">
          <span>₹{{ totalRevenue.toLocaleString() }}</span>
        </td>

        <td class="px-4 py-3 text-[#667085]">
          <span>Avg 84% Health</span>
        </td>

        <!-- Actions Th placeholder -->
        @if (showRowActions) {
          <td class="w-16 px-4 py-3 text-right"></td>
        }
      </tr>
    </tfoot>
  `
})
export class MasterTableFooterComponent {
  @Input() rowCount = 0;
  @Input() totalRevenue = 0;
  @Input() activeCount = 0;
  @Input() showSelection = true;
  @Input() showExpand = true;
  @Input() showRowActions = true;
}
