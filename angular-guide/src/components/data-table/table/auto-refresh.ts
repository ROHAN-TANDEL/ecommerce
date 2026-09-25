import {
  Component, Output, EventEmitter, ChangeDetectionStrategy,
  OnInit, OnDestroy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type RefreshInterval = '5s' | '15s' | '1m' | '5m' | 'live';

@Component({
  selector: 'dt-auto-refresh',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="relative flex items-center gap-1" (click)="$event.stopPropagation()">
      <button type="button" 
        class="inline-flex h-[34px] items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#436CF3]"
        (click)="triggerRefresh()"
        title="Refresh data">
        <span [class.animate-spin]="isRefreshing">⟳</span>
        <span *ngIf="activeInterval !== 'live'">{{ countdown }}s</span>
        <span *ngIf="activeInterval === 'live'" class="text-[#436CF3]">Live</span>
      </button>

      <button type="button" 
        class="inline-flex h-[34px] w-6 items-center justify-center rounded-md text-[9px] text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#436CF3]"
        (click)="toggleMenu()"
        title="Refresh options">
        ⌄
      </button>

      <div *ngIf="isMenuOpen" class="absolute left-0 top-full z-50 mt-1 min-w-[150px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl">
        <div class="px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Current</div>
        <button type="button" class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('5s')">
          <span class="w-4" [class.text-[#436CF3]]="activeInterval === '5s'">{{ activeInterval === '5s' ? '✓' : '' }}</span> 5 sec
        </button>
        <div class="my-1 border-t border-slate-100"></div>
        <button type="button" class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('15s')">
          <span class="w-4" [class.text-[#436CF3]]="activeInterval === '15s'">{{ activeInterval === '15s' ? '✓' : '' }}</span> 15 sec
        </button>
        <button type="button" class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('1m')">
          <span class="w-4" [class.text-[#436CF3]]="activeInterval === '1m'">{{ activeInterval === '1m' ? '✓' : '' }}</span> 1 min
        </button>
        <button type="button" class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('5m')">
          <span class="w-4" [class.text-[#436CF3]]="activeInterval === '5m'">{{ activeInterval === '5m' ? '✓' : '' }}</span> 5 min
        </button>
        <div class="my-1 border-t border-slate-100"></div>
        <button type="button" class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="setInterval('live')">
          <span class="w-4" [class.text-[#436CF3]]="activeInterval === 'live'">{{ activeInterval === 'live' ? '✓' : '' }}</span> Live update
        </button>
      </div>
    </div>
  `
})
export class AutoRefreshComponent implements OnInit, OnDestroy {
  @Output() refresh = new EventEmitter<void>();

  activeInterval: RefreshInterval = '5s';
  isMenuOpen = false;
  countdown = 5;
  isRefreshing = false;
  
  private intervalId: any;

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  setInterval(interval: RefreshInterval) {
    this.activeInterval = interval;
    this.isMenuOpen = false;
    this.resetCountdown();
  }

  triggerRefresh() {
    this.isRefreshing = true;
    this.refresh.emit();
    setTimeout(() => {
      this.isRefreshing = false;
    }, 500);
    this.resetCountdown();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isMenuOpen = false;
  }

  private resetCountdown() {
    this.clearTimer();
    switch (this.activeInterval) {
      case '5s': this.countdown = 5; break;
      case '15s': this.countdown = 15; break;
      case '1m': this.countdown = 60; break;
      case '5m': this.countdown = 300; break;
      case 'live': this.countdown = 0; break;
    }
    if (this.activeInterval !== 'live') {
      this.startCountdown();
    }
  }

  private startCountdown() {
    this.intervalId = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--;
      } else {
        this.triggerRefresh();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
