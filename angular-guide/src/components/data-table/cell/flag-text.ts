import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * FlagText — Country flag emoji + text cell format.
 *
 * CELL level · Format: Flag + text
 *
 * Rules:
 *   • Flag emoji is kept at a fixed visual width so text aligns consistently.
 *   • Long text truncates inside its column area.
 */
@Component({
  selector: 'dt-cell-flag-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-w-0 items-center gap-2">
      <span class="shrink-0 text-base leading-none" [title]="country">{{ flag }}</span>
      <span class="truncate text-xs text-slate-600" [title]="country">{{ country }}</span>
    </div>
  `,
})
export class FlagAndPlainText {
  @Input() flag: string = '';
  @Input() country: string = '';
}
