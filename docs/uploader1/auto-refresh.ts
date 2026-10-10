import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefreshStateService, RefreshInterval } from './refresh-state';

/**
 * AutoRefreshComponent
 *
 * Purely presentational — all timer state lives in the injected
 * RefreshStateService passed via [state] input.
 * Both the dropdown row and the pinned chip share the same service
 * instance, so there is exactly one timer per table.
 */
@Component({
  selector: 'dt-auto-refresh',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="relative flex items-center gap-1" (click)="$event.stopPropagation()">
      <button type="button"
        class="inline-flex h-[34px] items-center gap-1.5 rounded-md px-2.5 text-[11px]
               font-medium text-slate-600 transition-colors
               hover:bg-blue-50 hover:text-[#436CF3]"
        (click)="triggerRefresh()"
        title="Refresh data">
        <span [class.animate-spin]="state.isRefreshing">⟳</span>
        <span *ngIf="state.activeInterval !== 'live'">{{ state.countdown }}s</span>
        <span *ngIf="state.activeInterval === 'live'" class="text-[#436CF3]">Live</span>
      </button>

      <button type="button"
        class="inline-flex h-[34px] w-6 items-center justify-center rounded-md
               text-[9px] text-slate-600 transition-colors
               hover:bg-blue-50 hover:text-[#436CF3]"
        (click)="toggleMenu()"
        title="Refresh options">⌄</button>

      <div *ngIf="isMenuOpen"
           class="fixed left-2 top-2 z-[9999] min-w-[180px] rounded-lg border border-red-500 bg-white p-3 shadow-xl">
        <div class="px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Interval
        </div>
        <button type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
                 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('5s')">
          <span class="w-4" [class.text-[#436CF3]]="state.activeInterval === '5s'">
            {{ state.activeInterval === '5s' ? '✓' : '' }}
          </span> 5 sec
        </button>
        <div class="my-1 border-t border-slate-100"></div>
        <button type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
                 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('15s')">
          <span class="w-4" [class.text-[#436CF3]]="state.activeInterval === '15s'">
            {{ state.activeInterval === '15s' ? '✓' : '' }}
          </span> 15 sec
        </button>
        <button type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
                 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('1m')">
          <span class="w-4" [class.text-[#436CF3]]="state.activeInterval === '1m'">
            {{ state.activeInterval === '1m' ? '✓' : '' }}
          </span> 1 min
        </button>
        <button type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
                 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('5m')">
          <span class="w-4" [class.text-[#436CF3]]="state.activeInterval === '5m'">
            {{ state.activeInterval === '5m' ? '✓' : '' }}
          </span> 5 min
        </button>
        <div class="my-1 border-t border-slate-100"></div>
        <button type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
                 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('live')">
          <span class="w-4" [class.text-[#436CF3]]="state.activeInterval === 'live'">
            {{ state.activeInterval === 'live' ? '✓' : '' }}
          </span> Live update
        </button>
      </div>
    </div>
  `,
})
export class AutoRefreshComponent {
  @Input() state!: RefreshStateService;
  /** Kept for backward compat but no longer drives anything — RefreshStateService emits centrally */
  @Output() refresh = new EventEmitter<void>();

  isMenuOpen = false;

  toggleMenu(): void { 
    this.isMenuOpen = !this.isMenuOpen; 
    alert('isMenuOpen = ' + this.isMenuOpen);
  }

  setInterval(interval: RefreshInterval): void {
    this.state.setInterval(interval);
    this.isMenuOpen = false;
  }

  triggerRefresh(): void { this.state.requestRefresh(); }

  @HostListener('document:click')
  onDocumentClick(): void { this.isMenuOpen = false; }
}
