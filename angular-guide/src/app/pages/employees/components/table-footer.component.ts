import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'table-footer-component',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
  template: `
    <tr *ngIf="showEmptyState">
      <td [attr.colspan]="colspan" class="py-12 text-center text-slate-400">
        <div class="flex flex-col items-center gap-1.5">
          <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <span class="font-medium">No records found</span>
          <span class="text-[11px] text-slate-400">Try adjusting your filters or search keywords.</span>
        </div>
      </td>
    </tr>
  `,
})
export class TableFooterComponent {
  @Input() showEmptyState = false;
  @Input() colspan = 5;
}
