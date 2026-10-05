import {
  Component, Output, EventEmitter, ChangeDetectionStrategy,
  OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dt-lock-update',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="relative inline-flex items-center" (click)="$event.stopPropagation()">
      <button type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium shadow-sm transition-colors hover:border-slate-300"
        [class.bg-red-50]="isLocked"
        [class.border-red-200]="isLocked"
        [class.text-red-600]="isLocked"
        [class.bg-white]="!isLocked"
        [class.border-slate-200]="!isLocked"
        [class.text-slate-700]="!isLocked"
        [class.hover:bg-slate-50]="!isLocked"
        (click)="toggleLock()"
        [title]="isLocked ? 'Unlock update' : 'Lock for update'">
        <span>{{ isLocked ? '🔒' : '🔓' }}</span>
        <span>{{ isLocked ? 'Locked' : 'Lock' }}</span>
        <span *ngIf="isLocked" class="tabular-nums font-semibold text-red-500">{{ countdown }}s</span>
      </button>
    </div>
  `
})
export class LockUpdateComponent implements OnDestroy {
  @Output() lock = new EventEmitter<boolean>();

  isLocked = false;
  countdown = 60;
  private intervalId: any;

  ngOnDestroy() {
    this.clearTimer();
  }

  toggleLock() {
    this.isLocked = !this.isLocked;
    this.lock.emit(this.isLocked);

    if (this.isLocked) {
      this.startCountdown();
    } else {
      this.clearTimer();
    }
  }

  private startCountdown() {
    this.countdown = 60;
    this.clearTimer();
    this.intervalId = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--;
      } else {
        // Auto-unlock after 1 min
        this.isLocked = false;
        this.lock.emit(false);
        this.clearTimer();
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
