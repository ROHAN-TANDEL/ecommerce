import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * NumberCell — Currency / Number / Percentage cell format.
 *
 * CELL level · Format: Number, Currency, Percentage
 *
 * Rules:
 *   • Numbers are right-aligned by default (aligns decimal/grouping symbols).
 *   • Currency prefix/suffix is visually muted so the raw number is the focal point.
 *   • Empty / zero has its own defined representation.
 */
@Component({
  selector: 'dt-cell-number',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-end gap-1 tabular-nums">
      <span *ngIf="prefix" class="text-[10px] text-slate-400">{{ prefix }}</span>
      <span class="text-xs font-medium text-[#0A173D]">{{ formattedValue }}</span>
      <span *ngIf="suffix" class="text-[10px] text-slate-400">{{ suffix }}</span>
    </div>
  `,
})
export class NumberSeparationWithComma {
  @Input() value: number | string = 0;
  @Input() prefix: string = '';
  @Input() suffix: string = '';
  @Input() decimals: number = 0;

  get formattedValue(): string {
    const n =
      typeof this.value === 'string'
        ? parseFloat(this.value.replace(/[^0-9.-]/g, ''))
        : this.value;
    if (isNaN(n)) return String(this.value);
    return n.toLocaleString('en-IN', {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    });
  }
}
