import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="animate-pulse bg-[#EAECF0]"
      [ngClass]="getShapeClass()"
      [style.width]="width"
      [style.height]="height"
    ></div>
  `
})
export class NexoraSkeletonComponent {
  @Input() shape: 'line' | 'circle' | 'rect' = 'line';
  @Input() width = '100%';
  @Input() height = '14px';

  getShapeClass(): string {
    switch (this.shape) {
      case 'circle': return 'rounded-full';
      case 'rect': return 'rounded-lg';
      case 'line':
      default:
        return 'rounded';
    }
  }
}
