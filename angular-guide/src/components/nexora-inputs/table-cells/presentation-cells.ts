import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/* --- Status Badge Presentation Cell --- */
@Component({
  selector: 'nexora-cell-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      [ngClass]="getThemeClass()"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getDotClass()"></span>
      {{ label }}
    </span>
  `
})
export class NexoraCellBadgeComponent {
  @Input() label = 'Active';
  @Input() variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'success';

  getThemeClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-[#ECFDF3] text-[#027A48]';
      case 'warning': return 'bg-[#FEF0C7] text-[#B54708]';
      case 'error': return 'bg-[#FEF3F2] text-[#B42318]';
      case 'info': return 'bg-[#EFF4FF] text-[#175CD3]';
      default: return 'bg-[#F2F4F7] text-[#344054]';
    }
  }

  getDotClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-[#12B76A]';
      case 'warning': return 'bg-[#F79009]';
      case 'error': return 'bg-[#F04438]';
      case 'info': return 'bg-[#2E90FA]';
      default: return 'bg-[#667085]';
    }
  }
}

/* --- User Cell --- */
@Component({
  selector: 'nexora-cell-user',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2.5">
      <img *ngIf="avatar" [src]="avatar" class="w-7 h-7 rounded-full object-cover shrink-0" />
      <div *ngIf="!avatar" class="w-7 h-7 rounded-full bg-[#EFF4FF] text-[#436CF3] font-semibold text-xs flex items-center justify-center shrink-0">
        {{ name.slice(0, 1) }}
      </div>
      <div class="flex flex-col truncate">
        <span class="text-xs font-semibold text-[#1D2939] truncate leading-tight">{{ name }}</span>
        <span *ngIf="email" class="text-[10px] text-[#667085] truncate leading-tight">{{ email }}</span>
      </div>
    </div>
  `
})
export class NexoraCellUserComponent {
  @Input() name = '';
  @Input() email = '';
  @Input() avatar = '';
}

/* --- Progress Bar Cell --- */
@Component({
  selector: 'nexora-cell-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 w-full">
      <div class="flex-1 h-1.5 bg-[#EAECF0] rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          [style.width.%]="percent"
          [ngClass]="colorClass"
        ></div>
      </div>
      <span class="text-[11px] font-medium text-[#475467] shrink-0 w-8 text-right">{{ percent }}%</span>
    </div>
  `
})
export class NexoraCellProgressComponent {
  @Input() percent = 0;
  @Input() colorClass = 'bg-[#436CF3]';
}

/* --- Sparkline Mini-Trend Cell --- */
@Component({
  selector: 'nexora-cell-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <svg class="w-16 h-5 stroke-current overflow-visible" [class]="positive ? 'text-[#12B76A]' : 'text-[#F04438]'">
        <polyline
          fill="none"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          [attr.points]="svgPoints"
        />
      </svg>
      <span
        class="text-[10px] font-semibold"
        [class.text-[#12B76A]]="positive"
        [class.text-[#F04438]]="!positive"
      >
        {{ positive ? '+' : '' }}{{ changePercent }}%
      </span>
    </div>
  `
})
export class NexoraCellSparklineComponent {
  @Input() points: number[] = [10, 15, 12, 18, 14, 25];
  @Input() changePercent = 14.2;
  @Input() positive = true;

  get svgPoints(): string {
    const min = Math.min(...this.points);
    const max = Math.max(...this.points);
    const range = max - min || 1;
    const width = 64;
    const height = 18;
    const step = width / (this.points.length - 1);

    return this.points
      .map((val, idx) => {
        const x = idx * step;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}
