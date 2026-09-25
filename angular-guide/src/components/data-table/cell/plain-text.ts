import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PlainText — smallest visual unit for plain / truncated / wrapped text.
 *
 * CELL level · Format: Plain text, Truncated text, Wrapped text, Multi-line text
 *
 * Rules:
 *   • Truncated value indicates additional content via title tooltip.
 *   • Wrapped content increases visual height (when wrap=true).
 *   • Empty cell shows a defined empty-state representation.
 *   • Alignment follows content format where applicable.
 */
@Component({
  selector: 'dt-cell-plain-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="block text-xs text-slate-700"
      [class.truncate]="!wrap"
      [class.whitespace-normal]="wrap"
      [class.leading-snug]="wrap"
      [class.text-left]="align === 'left'"
      [class.text-right]="align === 'right'"
      [class.text-center]="align === 'center'"
      [title]="!wrap && value ? value : ''"
    >
      <ng-container *ngIf="value; else empty">{{ value }}</ng-container>
      <ng-template #empty>
        <span class="text-slate-300 italic">—</span>
      </ng-template>
    </span>
  `,
})
export class PlainTextCell {
  @Input() value: string = '';
  @Input() wrap: boolean = false;
  @Input() align: 'left' | 'right' | 'center' = 'left';
}
