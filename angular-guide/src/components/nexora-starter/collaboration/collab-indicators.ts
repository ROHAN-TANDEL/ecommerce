import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ViewerUser {
  id: string;
  name: string;
  initials: string;
  color?: string; // Tailwind color e.g. 'bg-blue-500'
}

@Component({
  selector: 'nexora-viewer-count',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2">
      <!-- Overlapping Avatar Stack -->
      <div class="flex items-center -space-x-2 overflow-hidden py-0.5">
        @for (user of visibleUsers; track user.id) {
          <div
            [class]="user.color || 'bg-blue-600'"
            class="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold ring-2 ring-white shadow-2xs"
            [title]="user.name"
          >
            {{ user.initials }}
          </div>
        }
      </div>

      <!-- Extra viewers count -->
      @if (extraCount > 0) {
        <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ring-1 ring-slate-200">
          +{{ extraCount }}
        </span>
      }

      @if (label) {
        <span class="text-xs text-slate-400 font-medium">
          {{ label }}
        </span>
      }
    </div>
  `
})
export class NexoraViewerCountComponent {
  @Input() viewers: ViewerUser[] = [];
  @Input() maxDisplay = 3;
  @Input() label = 'viewing';

  get visibleUsers(): ViewerUser[] {
    return this.viewers.slice(0, this.maxDisplay);
  }

  get extraCount(): number {
    return Math.max(0, this.viewers.length - this.maxDisplay);
  }
}

@Component({
  selector: 'nexora-editing-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-2xs"
    >
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>

      <span class="font-medium">
        <span class="font-bold">{{ userName }}</span> is editing this {{ targetType }}
      </span>
    </div>
  `
})
export class NexoraEditingIndicatorComponent {
  @Input() userName = 'Jo';
  @Input() targetType: 'row' | 'form' | 'document' | 'cell' = 'row';
}

@Component({
  selector: 'nexora-typing-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2 text-xs text-slate-500">
      <div class="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0ms"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 150ms"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 300ms"></span>
      </div>

      @if (userName) {
        <span>{{ userName }} is typing...</span>
      }
    </div>
  `
})
export class NexoraTypingIndicatorComponent {
  @Input() userName = '';
}

@Component({
  selector: 'nexora-row-lock-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
      [class]="locked ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
    >
      @if (locked) {
        <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
        </svg>
        <span>Locked by {{ lockedBy || 'another user' }}</span>
        @if (canUnlock) {
          <button
            type="button"
            (click)="unlock.emit()"
            class="text-[11px] text-blue-600 hover:text-blue-800 underline ml-1"
          >
            Unlock
          </button>
        }
      } @else {
        <svg class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"/>
        </svg>
        <span>Unlocked</span>
      }
    </div>
  `
})
export class NexoraRowLockIndicatorComponent {
  @Input() locked = true;
  @Input() lockedBy = '';
  @Input() canUnlock = false;
  @Output() unlock = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-sync-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5 text-xs font-medium" [class]="statusTextColor">
      <span class="w-2 h-2 rounded-full" [class]="statusDotColor"></span>
      <span>{{ labelText }}</span>
    </div>
  `
})
export class NexoraSyncStatusComponent {
  @Input() status: 'synced' | 'saving' | 'offline' | 'error' = 'synced';
  @Input() customText?: string;

  get labelText(): string {
    if (this.customText) return this.customText;
    switch (this.status) {
      case 'saving': return 'Saving changes...';
      case 'offline': return 'Offline • 3 queued';
      case 'error': return 'Sync failed';
      case 'synced':
      default: return 'All changes saved';
    }
  }

  get statusTextColor(): string {
    switch (this.status) {
      case 'saving': return 'text-blue-600';
      case 'offline': return 'text-amber-600';
      case 'error': return 'text-rose-600';
      case 'synced':
      default: return 'text-emerald-600';
    }
  }

  get statusDotColor(): string {
    switch (this.status) {
      case 'saving': return 'bg-blue-500 animate-pulse';
      case 'offline': return 'bg-amber-500';
      case 'error': return 'bg-rose-500';
      case 'synced':
      default: return 'bg-emerald-500';
    }
  }
}
