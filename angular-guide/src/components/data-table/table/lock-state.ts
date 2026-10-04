import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * LockStateService — single source of truth for one lock-update timer.
 *
 * Provided at the ToolbarActions component level so each table gets
 * exactly one instance. Both the dropdown row and the pinned chip
 * share this instance — countdown and locked state are always in sync.
 */
@Injectable()
export class LockStateService implements OnDestroy {
  isLocked  = false;
  countdown = 60;

  /** Emits true when locked, false when unlocked */
  readonly lockChanged = new Subject<boolean>();

  private timerId: ReturnType<typeof setInterval> | null = null;

  toggleLock(): void {
    this.isLocked = !this.isLocked;
    this.lockChanged.next(this.isLocked);

    if (this.isLocked) {
      this.startCountdown();
    } else {
      this.stopTimer();
      this.countdown = 60;
    }
  }

  private startCountdown(): void {
    this.countdown = 60;
    this.stopTimer();
    this.timerId = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--;
      } else {
        // Auto-unlock after 1 min
        this.isLocked = false;
        this.lockChanged.next(false);
        this.countdown = 60;
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.lockChanged.complete();
  }
}
