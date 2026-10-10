import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * StatusBadge — Coloured pill badge for status values.
 *
 * CELL level · Format: Status badge
 *
 * Rules:
 *   • Visually distinguishable from plain text cells.
 *   • Built-in presets for Active / Pending / Disabled / Suspended / Locked.
 *   • Unknown statuses fall back to a neutral grey badge.
 */
@Component({
  selector: 'dt-cell-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-2xs"
      [ngClass]="badgeClasses"
    >
      <span class="h-1.5 w-1.5 rounded-full" [ngClass]="dotClasses" aria-hidden="true"></span>
      {{ statusDisplay }}
    </span>
  `,
})
export class StatusBadgeCell {
  @Input() status: string = '';

  private readonly presets: Record<string, string> = {
    active:    'bg-emerald-50/80 text-emerald-700 border border-emerald-200/70 ring-1 ring-emerald-500/10',
    pending:   'bg-amber-50/80 text-amber-700 border border-amber-200/70 ring-1 ring-amber-500/10',
    inactive:  'bg-slate-100/90 text-slate-600 border border-slate-200/80 ring-1 ring-slate-400/10',
    disabled:  'bg-rose-50/80 text-rose-700 border border-rose-200/70 ring-1 ring-rose-400/15',
    suspended: 'bg-rose-50/80 text-rose-700 border border-rose-200/70 ring-1 ring-rose-400/15',
    deleted:   'bg-rose-50/80 text-rose-700 border border-rose-200/70 ring-1 ring-rose-400/15',
    locked:    'bg-slate-100 text-slate-500 border border-slate-200/70',
  };

  private readonly dotPresets: Record<string, string> = {
    active:    'bg-emerald-500',
    pending:   'bg-amber-500',
    inactive:  'bg-slate-400',
    disabled:  'bg-rose-500',
    suspended: 'bg-rose-500',
    deleted:   'bg-rose-500',
    locked:    'bg-slate-400',
  };

  get badgeClasses(): string {
    return this.presets[(this.status || '').toLowerCase().trim()] ?? 'bg-slate-100/90 text-slate-600 border border-slate-200/80';
  }

  get dotClasses(): string {
    return this.dotPresets[(this.status || '').toLowerCase().trim()] ?? 'bg-slate-400';
  }

  get statusDisplay(): string {
    return (this.status || '').trim().toUpperCase();
  }
}
