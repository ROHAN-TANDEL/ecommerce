import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

@Component({
  selector: 'nexora-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-2xs"
      [ngClass]="getClasses()"
    >
      <span *ngIf="showDot" class="w-1.5 h-1.5 rounded-full" [ngClass]="getDotClass()"></span>
      {{ label }}
    </span>
  `
})
export class NexoraStatusBadgeComponent {
  @Input() label = 'ACTIVE';
  @Input() variant: StatusVariant = 'success';
  @Input() showDot = true;

  getClasses(): string {
    switch (this.variant) {
      case 'success': return 'bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]';
      case 'warning': return 'bg-[#FEF0C7] text-[#B54708] border border-[#FEDF89]';
      case 'error': return 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]';
      case 'info': return 'bg-[#EFF4FF] text-[#175CD3] border border-[#B2CCFF]';
      case 'purple': return 'bg-[#F9F5FF] text-[#6941C6] border border-[#E9D7FE]';
      case 'neutral':
      default:
        return 'bg-[#F2F4F7] text-[#344054] border border-[#EAECF0]';
    }
  }

  getDotClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-[#12B76A]';
      case 'warning': return 'bg-[#F79009]';
      case 'error': return 'bg-[#F04438]';
      case 'info': return 'bg-[#2E90FA]';
      case 'purple': return 'bg-[#7F56D9]';
      default: return 'bg-[#667085]';
    }
  }
}

@Component({
  selector: 'nexora-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
      [ngClass]="getColorClass()"
    >
      <span *ngIf="icon">{{ icon }}</span>
      <span>{{ label }}</span>
    </span>
  `
})
export class NexoraBadgeComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() variant: 'blue' | 'green' | 'amber' | 'red' | 'gray' = 'blue';

  getColorClass(): string {
    switch (this.variant) {
      case 'green': return 'bg-[#ECFDF3] text-[#027A48]';
      case 'amber': return 'bg-[#FEF0C7] text-[#B54708]';
      case 'red': return 'bg-[#FEF3F2] text-[#B42318]';
      case 'gray': return 'bg-[#F2F4F7] text-[#344054]';
      case 'blue':
      default:
        return 'bg-[#EFF4FF] text-[#175CD3]';
    }
  }
}
