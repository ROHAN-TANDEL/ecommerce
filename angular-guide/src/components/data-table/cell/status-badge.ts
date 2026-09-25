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
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
      [ngClass]="badgeClasses"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
      {{ status }}
    </span>
  `,
})
export class StatusBadgeCell {
  @Input() status: string = '';

  private readonly presets: Record<string, string> = {
    active:    'bg-emerald-50 text-emerald-700',
    pending:   'bg-amber-50 text-amber-700',
    disabled:  'bg-red-50 text-red-600',
    suspended: 'bg-violet-50 text-violet-700',
    locked:    'bg-slate-100 text-slate-500',
  };

  get badgeClasses(): string {
    return this.presets[this.status.toLowerCase()] ?? 'bg-slate-100 text-slate-600';
  }
}
