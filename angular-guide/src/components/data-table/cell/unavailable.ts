import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Unavailable — Represents a cell whose value is absent, in error, or has a warning.
 *
 * CELL level · State: empty | error | warning
 *
 * Rules:
 *   • An empty cell has a defined empty-state representation (N/A).
 *   • A cell in error has a red badge.
 *   • A cell with a warning has an amber badge.
 * Constraints:
 *   • One primary presentation state at a time.
 */
@Component({
  selector: 'dt-cell-unavailable',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="state === 'error'"
      class="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600"
      [title]="message || 'Error'"
    >
      <span aria-hidden="true">⚠</span>{{ message || 'Error' }}
    </div>

    <div
      *ngIf="state === 'warning'"
      class="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600"
      [title]="message || 'Warning'"
    >
      <span aria-hidden="true">▲</span>{{ message || 'Warning' }}
    </div>

    <span
      *ngIf="state === 'empty'"
      class="text-[11px] text-slate-300 italic select-none"
      aria-label="No value"
    >N/A</span>
  `,
})
export class UnavailableCell {
  @Input() state: 'error' | 'warning' | 'empty' = 'empty';
  @Input() message: string = '';
}
