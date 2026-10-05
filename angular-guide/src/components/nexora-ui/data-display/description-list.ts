import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DescriptionItem {
  label: string;
  value: string;
  badge?: string;
}

@Component({
  selector: 'nexora-description-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-[#EAECF0] bg-white overflow-hidden shadow-xs divide-y divide-[#EAECF0]">
      <div
        *ngFor="let item of items; let odd = odd"
        class="px-4 py-3 flex items-center justify-between text-xs transition-colors"
        [class.bg-[#F9FAFB]]="striped && odd"
      >
        <span class="font-medium text-[#667085]">{{ item.label }}</span>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-[#101828] text-right">{{ item.value }}</span>
          <span
            *ngIf="item.badge"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EFF4FF] text-[#436CF3]"
          >
            {{ item.badge }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class NexoraDescriptionListComponent {
  @Input() items: DescriptionItem[] = [];
  @Input() striped = false;
}
