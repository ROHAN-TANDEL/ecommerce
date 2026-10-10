import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-[#EAECF0] bg-white shadow-xs overflow-hidden">
      <!-- Card Header -->
      <div *ngIf="title || hasHeaderSlot" class="px-5 py-4 border-b border-[#EAECF0] flex items-center justify-between">
        <div>
          <h3 *ngIf="title" class="text-sm font-bold text-[#101828]">{{ title }}</h3>
          <p *ngIf="subtitle" class="text-xs text-[#667085] mt-0.5">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-5 text-xs text-[#344054]">
        <ng-content></ng-content>
      </div>

      <!-- Card Footer -->
      <div *ngIf="hasFooterSlot" class="px-5 py-3 bg-[#F9FAFB] border-t border-[#EAECF0] flex items-center justify-between">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class NexoraCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() hasHeaderSlot = false;
  @Input() hasFooterSlot = false;
}
