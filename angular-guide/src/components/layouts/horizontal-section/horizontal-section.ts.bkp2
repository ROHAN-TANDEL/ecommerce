import { Component, Input } from '@angular/core';

@Component({
  selector: 'nexora-horizontal-section',
  imports: [],
  templateUrl: './horizontal-section.html',
  styleUrl: './horizontal-section.css',
})
export class HorizontalSection {
  @Input() rows = 1;
  @Input() gap = 4;
  @Input() align: 'left' | 'center' | 'right' = 'left';

  get rowClass(): string {
    const rows: Record<number, string> = {
      1: 'grid-rows-1',
      2: 'grid-rows-2',
      3: 'grid-rows-3',
      4: 'grid-rows-4',
      5: 'grid-rows-5',
      6: 'grid-rows-6',
      7: 'grid-rows-7',
      8: 'grid-rows-8'
    };

    return rows[this.rows] ?? 'grid-rows-1';
  }

  get gapClass(): string {
    const gaps: Record<number, string> = {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8'
    };

    return gaps[this.gap] ?? 'gap-4';
  }

  get alignmentClass(): string {
    const alignment: Record<string, string> = {
      left: 'justify-items-start',
      center: 'justify-items-center',
      right: 'justify-items-end'
    };

    return alignment[this.align];
  }
}
