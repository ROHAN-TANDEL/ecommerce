import { Component, Input } from '@angular/core';

@Component({
  selector: 'nexora-vertical-section',
  imports: [],
  templateUrl: './vertical-section.html',
  styleUrl: './vertical-section.css',
})

export class VerticalSection {

  @Input() columns = 1;
  @Input() gap = 4;
  @Input() align: 'left' | 'center' | 'right' | null = null;

  get columnClass(): string {
    const columns: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8'
    };

    return columns[this.columns] ?? 'grid-cols-1';
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

      if (!this.align) {
        return '';
      }

    const alignment: Record<string, string> = {
      left: 'justify-items-start',
      center: 'justify-items-center',
      right: 'justify-items-end'
    };

    return alignment[this.align];
  }
}
