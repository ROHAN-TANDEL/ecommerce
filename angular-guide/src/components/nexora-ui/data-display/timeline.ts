import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineEvent {
  id: string | number;
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  user?: string;
  status?: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'nexora-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAECF0]">
      <div *ngFor="let item of events" class="relative group">
        <!-- Dot / Icon -->
        <div
          class="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-xs"
          [ngClass]="getDotClass(item.status)"
        >
          <span *ngIf="item.icon">{{ item.icon }}</span>
        </div>

        <!-- Event Body -->
        <div class="flex flex-col">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-[#101828]">{{ item.title }}</span>
            <span class="text-[10px] text-[#98A2B3] shrink-0">{{ item.timestamp }}</span>
          </div>

          <p *ngIf="item.description" class="text-xs text-[#667085] mt-1 leading-relaxed">
            {{ item.description }}
          </p>

          <span *ngIf="item.user" class="text-[10px] font-medium text-[#436CF3] mt-1">
            by {{ item.user }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class NexoraTimelineComponent {
  @Input() events: TimelineEvent[] = [];

  getDotClass(status?: string): string {
    switch (status) {
      case 'success': return 'bg-[#12B76A] text-white';
      case 'warning': return 'bg-[#F79009] text-white';
      case 'error': return 'bg-[#F04438] text-white';
      case 'info':
      default:
        return 'bg-[#436CF3] text-white';
    }
  }
}
