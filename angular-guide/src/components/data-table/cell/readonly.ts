import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Readonly — Wraps any projected cell content in a read-only visual treatment.
 *
 * CELL level · State: readOnly
 *
 * Rules:
 *   • Cannot visually use the editing presentation.
 *   • Cell hover does not override the read-only state.
 * Constraints:
 *   • Must not visually appear editable.
 *   • Locked and editable states cannot coexist — read-only wins.
 *
 * Usage:
 *   <dt-cell-readonly>
 *     <dt-cell-plain-text [value]="row.email" />
 *   </dt-cell-readonly>
 */
@Component({
  selector: 'dt-cell-readonly',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex min-w-0 items-center"
      [class.opacity-70]="muted"
      [attr.aria-readonly]="true"
    >
      <span *ngIf="showLock" class="mr-1.5 shrink-0 text-[10px] text-slate-300" aria-hidden="true">🔒</span>
      <ng-content />
    </div>
  `,
})
export class ReadonlyCell {
  @Input() muted: boolean = false;
  @Input() showLock: boolean = false;
}
