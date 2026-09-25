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
    <div class="relative flex items-center gap-1" (click)="$event.stopPropagation()">
      <button type="button"
        class="inline-flex h-[34px] items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors"
        [class.bg-red-50]="isLocked"
        [class.text-red-600]="isLocked"
        [class.text-slate-600]="!isLocked"
        [class.hover:bg-slate-50]="!isLocked"
        (click)="toggleLock()"
        [title]="isLocked ? 'Unlock update' : 'Lock for update'">
        <span>{{ isLocked ? '🔒' : '🔓' }}</span>
        <span>Lock</span>
        <span *ngIf="isLocked" class="ml-1 text-red-500">{{ countdown }}s</span>
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
