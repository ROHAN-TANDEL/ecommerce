import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-count-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center justify-center font-bold px-1.5 py-0.5 rounded-full leading-none shadow-2xs"
      [class.bg-[#F2F4F7]]="variant === 'neutral'"
      [class.text-[#344054]]="variant === 'neutral'"
      [class.bg-[#EFF4FF]]="variant === 'primary'"
      [class.text-[#436CF3]]="variant === 'primary'"
      [class.bg-[#FEF3F2]]="variant === 'danger'"
      [class.text-[#F04438]]="variant === 'danger'"
      [class.text-[10px]]="size === 'sm'"
      [class.text-xs]="size === 'md'"
    >
      {{ displayCount }}
    </span>
  `
})
export class NexoraCountBadgeComponent {
  @Input() count: number | string = 0;
  @Input() max = 99;
  @Input() variant: 'neutral' | 'primary' | 'danger' = 'neutral';
  @Input() size: 'sm' | 'md' = 'sm';

  get displayCount(): string {
    if (typeof this.count === 'number' && this.count > this.max) {
      return `${this.max}+`;
    }
    if (typeof this.count === 'number' && this.count > 0 && !String(this.count).startsWith('+')) {
      return `+${this.count}`;
    }
    return String(this.count);
  }
}

@Component({
  selector: 'nexora-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center">
      <ng-content></ng-content>
      <!-- Dot or Counter -->
      <span
        *ngIf="show"
        class="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-[#F04438] text-white font-bold leading-none shadow-xs ring-2 ring-white"
        [class.w-2]="dotOnly"
        [class.h-2]="dotOnly"
        [class.min-w-[16px]]="!dotOnly"
        [class.h-4]="!dotOnly"
        [class.px-1]="!dotOnly"
        [class.text-[9px]]="!dotOnly"
      >
        <span *ngIf="!dotOnly">{{ count }}</span>
      </span>
    </div>
  `
})
export class NexoraNotificationBadgeComponent {
  @Input() count?: number;
  @Input() dotOnly = false;
  @Input() show = true;
}
