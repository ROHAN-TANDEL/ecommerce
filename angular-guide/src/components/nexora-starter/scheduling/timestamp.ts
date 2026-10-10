import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-timestamp',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#475467] select-none">
      <span *ngIf="showClock || showIcon" class="text-[10px] text-[#98A2B3]">🕒</span>
      <span>{{ displayValue }}</span>
    </span>
  `
})
export class NexoraTimestampComponent {
  @Input() date: Date | string = '2026-10-02T10:32:00';
  @Input() format: 'date' | 'time' | 'datetime' | 'iso' = 'datetime';
  @Input() showIcon = false;
  @Input() showClock = false;
  @Input() showTime = true;
  @Input() showSeconds = false;

  get parsedDate(): Date {
    return new Date(this.date);
  }

  get displayValue(): string {
    const d = this.parsedDate;
    if (isNaN(d.getTime())) return String(this.date);

    switch (this.format) {
      case 'date':
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      case 'time':
        return d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: this.showSeconds ? '2-digit' : undefined,
          hour12: true
        });
      case 'iso':
        return d.toISOString();
      case 'datetime':
      default: {
        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: this.showSeconds ? '2-digit' : undefined,
          hour12: true
        });
        return `${dateStr} • ${timeStr}`;
      }
    }
  }
}

@Component({
  selector: 'nexora-relative-date',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center text-xs font-medium text-[#667085] hover:text-[#101828] transition-colors cursor-help"
      [title]="dateString"
    >
      {{ relativeText }}
    </span>
  `
})
export class NexoraRelativeDateComponent {
  @Input() date: Date | string = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

  get dateString(): string {
    return new Date(this.date).toLocaleString();
  }

  get relativeText(): string {
    const past = new Date(this.date).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} days ago`;
    return 'over a month ago';
  }
}
