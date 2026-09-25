import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { CollabUser } from '../models/column-def.model';

/**
 * CollabBar — Live collaboration presence strip.
 *
 * TABLE level · sits between the toolbar and the table header.
 * Shows who is viewing and who is actively editing.
 * Only rendered when TableConfig.live_collaboration.enabled = true.
 *
 * Visual elements:
 *   • Animated green ping dot + "Live collaboration" label
 *   • Stacked avatar chips (overlapping, max 5 shown + overflow count)
 *   • "N users are viewing this table"
 *   • "M user(s) editing" with their avatar chips on the right
 */
@Component({
  selector: 'dt-collab-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule],
  template: `
  <div class="flex items-center justify-between border-b border-slate-200
              bg-[#F7F9FC] px-4 py-2">

    <!-- Left: viewing users -->
    <div class="flex items-center gap-3">

      <!-- Live dot -->
      <div class="flex items-center gap-2">
        <span class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full
                       bg-emerald-400 opacity-60"></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
        <span class="text-xs font-medium text-slate-700">Live collaboration</span>
      </div>

      <div class="h-4 w-px bg-slate-200"></div>

      <!-- Avatar stack — viewers -->
      <div class="flex items-center -space-x-2">
        <div *ngFor="let u of visibleViewers"
          class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white
                 text-[9px] font-semibold"
          [ngClass]="[u.color, u.textColor]"
          [title]="u.name">
          {{ u.initials }}
        </div>
        <div *ngIf="overflowViewerCount > 0"
          class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white
                 bg-slate-200 text-[9px] font-semibold text-slate-600"
          [title]="overflowViewerCount + ' more users'">
          +{{ overflowViewerCount }}
        </div>
      </div>

      <span class="text-xs text-slate-500">
        <span class="font-medium text-slate-700">{{ viewingCount }}</span>
        {{ viewingCount === 1 ? 'user is' : 'users are' }} viewing this table
      </span>

    </div>

    <!-- Right: editing users -->
    <div *ngIf="editingCount > 0" class="flex items-center gap-2 text-[11px] text-slate-400">
      <span>{{ editingCount === 1 ? '1 user is editing' : editingCount + ' users are editing' }}</span>
      <div *ngFor="let u of editingUsers"
        class="flex h-5 w-5 items-center justify-center rounded-full
               text-[9px] font-semibold"
        [ngClass]="[u.color, u.textColor]"
        [title]="u.name + ' is editing'">
        {{ u.initials }}
      </div>
    </div>

  </div>
  `,
})
export class CollabBar {
  /** All users currently connected to this table session */
  @Input() users: CollabUser[] = [];
  /** Max avatars to show before +N overflow */
  @Input() maxVisible: number = 5;

  get viewingUsers(): CollabUser[] { return this.users.filter(u => u.isViewing); }
  get editingUsers(): CollabUser[] { return this.users.filter(u => u.isEditing); }
  get viewingCount(): number { return this.viewingUsers.length; }
  get editingCount(): number { return this.editingUsers.length; }
  get visibleViewers(): CollabUser[] { return this.viewingUsers.slice(0, this.maxVisible); }
  get overflowViewerCount(): number {
    return Math.max(0, this.viewingCount - this.maxVisible);
  }
}
