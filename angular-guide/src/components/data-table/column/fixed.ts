import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Fixed — Sticky/frozen column <th> header cell.
 *
 * COLUMN level · Property: frozen=true
 *
 * Rules:
 *   • A frozen column has a visually distinguishable boundary.
 *   • A frozen column maintains its position relative to the configured freeze boundary.
 *   • Header and cell alignment remain consistent (sticky positioning).
 * Constraints:
 *   • Must maintain its position (sticky left/right via CSS).
 *   • Hidden columns must not occupy visible table space.
 */
@Component({
  selector: 'dt-col-fixed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <th
      class="sticky z-10 bg-[#EEF2FF] px-3 py-3 text-left text-[11px] font-semibold text-[#0A173D]
             after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-[#436CF3]/20"
      [style.left]="side === 'left' ? offset : 'auto'"
      [style.right]="side === 'right' ? offset : 'auto'"
      [style.width]="width"
      [style.minWidth]="minWidth"
      [attr.aria-label]="label + ' (frozen)'"
    >
      <div class="flex items-center gap-1.5">
        <span class="truncate">{{ label }}</span>
        <span class="shrink-0 text-[9px] text-[#436CF3]/50" aria-hidden="true">📌</span>
      </div>
    </th>
  `,
})
export class FixedColumns {
  @Input() label: string = '';
  @Input() width: string = '200px';
  @Input() minWidth: string = '120px';
  @Input() side: 'left' | 'right' = 'left';
  @Input() offset: string = '0px';
}
