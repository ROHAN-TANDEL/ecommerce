import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-split-pane',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #container
      class="flex rounded-xl border border-[#EAECF0] bg-white overflow-hidden shadow-xs min-h-[180px] relative select-none"
    >
      <!-- Left pane -->
      <div [style.width.%]="leftWidth" class="p-4 border-r border-[#EAECF0] overflow-y-auto">
        <ng-content select="[pane-left], [left]"></ng-content>
      </div>

      <!-- Resizer Handle -->
      <div
        (mousedown)="startDrag($event)"
        class="w-1 bg-[#EAECF0] hover:bg-[#436CF3] active:bg-[#436CF3] cursor-col-resize transition-colors flex items-center justify-center group relative z-10"
        title="Drag to resize"
      >
        <div class="w-3 h-6 rounded bg-white border border-[#D0D5DD] shadow-2xs group-hover:border-[#436CF3] flex items-center justify-center">
          <div class="flex flex-col gap-0.5">
            <span class="w-0.5 h-0.5 rounded-full bg-[#98A2B3]"></span>
            <span class="w-0.5 h-0.5 rounded-full bg-[#98A2B3]"></span>
            <span class="w-0.5 h-0.5 rounded-full bg-[#98A2B3]"></span>
          </div>
        </div>
      </div>

      <!-- Right pane -->
      <div [style.width.%]="100 - leftWidth" class="p-4 bg-[#FAFAFA] overflow-y-auto flex-1">
        <ng-content select="[pane-right], [right]"></ng-content>
      </div>
    </div>
  `
})
export class NexoraSplitPaneComponent {
  @Input() set initialLeftWidth(val: number) {
    if (val) this.leftWidth = val;
  }
  @Input() leftWidth = 35; // percentage

  isDragging = false;
  private startX = 0;
  private startWidth = 35;

  startDrag(e: MouseEvent) {
    e.preventDefault();
    this.isDragging = true;
    this.startX = e.clientX;
    this.startWidth = this.leftWidth;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    const delta = e.clientX - this.startX;
    // Estimate width based on typical window width percentage
    const deltaPercent = (delta / 800) * 100;
    const newWidth = Math.min(80, Math.max(20, this.startWidth + deltaPercent));
    this.leftWidth = Math.round(newWidth);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }
}
