import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'table-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs relative">

      <!-- Loading overlay indicator -->
      <div *ngIf="isLoading" class="absolute inset-0 bg-white/60 backdrop-blur-2xs z-30 flex items-center justify-center">
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-medium">
          <span class="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          <span>Loading data...</span>
        </div>
      </div>

      <!-- Viewport Scroll Container with min/max height -->
      <div
        class="overflow-auto relative"
        [style.min-height]="minHeight"
        [style.max-height]="maxHeight"
      >
        <table class="w-full text-left border-collapse table-fixed">
          <ng-content></ng-content>
        </table>
      </div>

    </div>
  `,
})
export class TableComponent {
  @Input() isLoading = false;
  @Input() minHeight = '380px';
  @Input() maxHeight = 'calc(100vh - 240px)';
}
