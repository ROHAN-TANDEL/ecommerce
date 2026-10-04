import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export type RefreshInterval = '5s' | '15s' | '1m' | '5m' | 'live';

const INTERVAL_SECONDS: Record<RefreshInterval, number> = {
  '5s': 5,
  '15s': 15,
  '1m': 60,
  '5m': 300,
  live: 0,
};

/**
 * RefreshStateService — single source of truth for one auto-refresh timer.
 *
 * Provided at the ToolbarActions component level (providers: [RefreshStateService])
 * so each table gets exactly one instance.  Both the dropdown row and the pinned
 * chip share this instance, keeping countdown and refresh events in sync.
 */
@Injectable()
export class RefreshStateService implements OnDestroy {
  activeInterval: RefreshInterval = '5s';
  countdown = 5;
  isRefreshing = false;

  /** Emits once per refresh tick — ToolbarActions subscribes once. */
  readonly refreshRequested = new Subject<void>();

  private timerId: ReturnType<typeof setInterval> | null = null;
  private refreshAnimationId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.startTimer();
  }

  setInterval(interval: RefreshInterval): void {
    this.activeInterval = interval;
    this.resetTimer();
  }

  requestRefresh(): void {
    this.isRefreshing = true;
    this.refreshRequested.next();

    if (this.refreshAnimationId !== null) clearTimeout(this.refreshAnimationId);
    this.refreshAnimationId = setTimeout(() => {
      this.isRefreshing = false;
      this.refreshAnimationId = null;
    }, 500);

    this.resetTimer();
  }

  private resetTimer(): void {
    this.stopTimer();
    this.countdown = INTERVAL_SECONDS[this.activeInterval];
    if (this.activeInterval !== 'live') this.startTimer();
  }

  private startTimer(): void {
    if (this.activeInterval === 'live' || this.timerId !== null) return;
    this.timerId = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--;
      } else {
        this.requestRefresh();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) { clearInterval(this.timerId); this.timerId = null; }
  }

  ngOnDestroy(): void {
    this.stopTimer();
    if (this.refreshAnimationId !== null) clearTimeout(this.refreshAnimationId);
    this.refreshRequested.complete();
  }
}
