import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 rounded-2xl border border-[#EAECF0] bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-[#667085]">{{ title }}</span>
        <div *ngIf="icon" class="w-8 h-8 rounded-lg bg-[#F8F9FC] border border-[#EAECF0] flex items-center justify-center text-xs text-[#436CF3]">
          {{ icon }}
        </div>
      </div>

      <!-- Main Value -->
      <div class="my-3">
        <div class="text-2xl font-bold text-[#101828] tracking-tight">{{ value }}</div>
      </div>

      <!-- Footer Trend Delta -->
      <div class="flex items-center gap-2 text-xs">
        <span
          *ngIf="change !== undefined"
          class="inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-full text-[11px]"
          [class.bg-[#ECFDF3]]="isPositive"
          [class.text-[#027A48]]="isPositive"
          [class.bg-[#FEF3F2]]="!isPositive"
          [class.text-[#B42318]]="!isPositive"
        >
          <span>{{ isPositive ? '↑' : '↓' }}</span>
          <span>{{ change }}%</span>
        </span>

        <span *ngIf="period" class="text-[#667085] text-[11px]">{{ period }}</span>
      </div>
    </div>
  `
})
export class NexoraStatCardComponent {
  @Input() title = 'Total Revenue';
  @Input() value = '₹12.4M';
  @Input() change?: number = 12.4;
  @Input() isPositive = true;
  @Input() period = 'vs last month';
  @Input() icon = '📊';
}
