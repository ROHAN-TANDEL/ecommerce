import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Disabled — Applies the disabled visual treatment to any projected cell content.
 *
 * CELL level · State: disabled (enabled=false)
 *
 * Rules:
 *   • Appears visually muted (opacity-40).
 *   • Hover must not override the disabled state.
 * Constraints:
 *   • Cannot appear as an active/editable cell.
 *   • pointer-events: none prevents accidental interaction.
 *
 * Usage:
 *   <dt-cell-disabled>
 *     <dt-cell-plain-text [value]="row.field" />
 *   </dt-cell-disabled>
 */
@Component({
  selector: 'dt-cell-disabled',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex min-w-0 items-center select-none pointer-events-none opacity-40"
      [attr.aria-disabled]="true"
    >
      <ng-content />
    </div>
  `,
})
export class DisabledCell {}
