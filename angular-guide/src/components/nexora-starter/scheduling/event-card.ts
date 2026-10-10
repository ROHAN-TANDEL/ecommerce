import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-event-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="p-3 rounded-xl border bg-white shadow-xs flex items-start gap-3 transition-all hover:shadow-sm"
      [class.border-l-4]="true"
      [class.border-l-[#436CF3]]="category === 'primary'"
      [class.border-l-[#12B76A]]="category === 'success'"
      [class.border-l-[#F79009]]="category === 'warning'"
      [class.border-[#EAECF0]]="true"
    >
      <div class="flex flex-col items-center justify-center w-10 py-1 rounded-lg bg-[#F8F9FC] border border-[#EAECF0] shrink-0 text-center">
        <span class="text-[9px] font-bold uppercase text-[#667085]">{{ month }}</span>
        <span class="text-sm font-extrabold text-[#101828] leading-none">{{ day }}</span>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h5 class="text-xs font-bold text-[#101828] truncate">{{ title }}</h5>
          <span *ngIf="recurring" class="text-[9px] font-semibold text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.2 rounded shrink-0">
            ↻ Recurring
          </span>
        </div>
        <p *ngIf="description" class="text-[11px] text-[#667085] truncate mt-0.5">{{ description }}</p>
        <div class="flex items-center gap-2 mt-1.5 text-[10px] text-[#98A2B3]">
          <span class="flex items-center gap-1 font-medium text-[#475467]">🕒 {{ time }}</span>
          <span *ngIf="location">&bull; 📍 {{ location }}</span>
        </div>
      </div>
    </div>
  `
})
export class NexoraEventCardComponent {
  @Input() title = 'Sprint Planning & Release Review';
  @Input() description = 'Quarterly platform roadmap alignment with leads.';
  @Input() month = 'OCT';
  @Input() day = '16';
  @Input() time = '10:00 AM - 11:30 AM';
  @Input() location = 'Virtual Meet';
  @Input() recurring = true;
  @Input() category: 'primary' | 'success' | 'warning' = 'primary';
}

@Component({
  selector: 'nexora-agenda-slot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#F9FAFB] transition-colors border-b border-[#F2F4F7] text-xs">
      <span class="w-16 font-mono text-[11px] font-semibold text-[#667085] shrink-0">{{ timeSlot }}</span>
      <div class="w-2 h-2 rounded-full" [ngClass]="getDotClass()"></div>
      <span class="font-medium text-[#101828] flex-1 truncate">{{ label }}</span>
      <span *ngIf="badge" class="text-[10px] text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded-full shrink-0">
        {{ badge }}
      </span>
    </div>
  `
})
export class NexoraAgendaSlotComponent {
  @Input() timeSlot = '09:00 AM';
  @Input() label = 'API Health Check Run';
  @Input() badge = '';
  @Input() status: 'scheduled' | 'running' | 'completed' = 'scheduled';

  getDotClass(): string {
    switch (this.status) {
      case 'running': return 'bg-[#F79009] animate-pulse';
      case 'completed': return 'bg-[#12B76A]';
      case 'scheduled':
      default:
        return 'bg-[#436CF3]';
    }
  }
}

@Component({
  selector: 'nexora-event-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#EFF4FF] text-[#436CF3] border border-[#B2CCFF]">
      <span class="w-1.5 h-1.5 rounded-full bg-[#436CF3]"></span>
      <span>{{ count }} events</span>
    </span>
  `
})
export class NexoraEventIndicatorComponent {
  @Input() count = 1;
}
