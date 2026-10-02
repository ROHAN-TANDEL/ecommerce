import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  duration?: number; // ms, default 3000
}

/**
 * Toast — floating notification panel.
 *
 * Four types:
 *   success — green  (record created / saved)
 *   error   — red    (API failure)
 *   warning — yellow (non-blocking issue)
 *   info    — blue   (neutral status)
 *
 * Auto-dismisses after `duration` ms.
 * Stacks vertically — newest on top.
 *
 * Usage (in any component):
 *   <app-toast [toasts]="toasts" (dismiss)="removeToast($event)" />
 *
 * Helper (import from toast.ts):
 *   pushToast(toasts, 'success', 'User saved')  → returns new array
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule],
  template: `
    <div class="fixed right-5 top-5 z-[200] flex flex-col gap-2 pointer-events-none"
         aria-live="polite">
      <div *ngFor="let t of toasts; trackBy: trackId"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3
               shadow-lg text-sm font-medium min-w-[280px] max-w-[360px]
               animate-toast-in transition-all"
        [ngClass]="styles(t.type)">

        <!-- Icon -->
        <span class="shrink-0 text-base mt-0.5">{{ icon(t.type) }}</span>

        <!-- Message -->
        <span class="flex-1 leading-snug">{{ t.message }}</span>

        <!-- Dismiss -->
        <button type="button"
          class="shrink-0 opacity-50 hover:opacity-100 transition-opacity text-[13px] mt-0.5"
          (click)="dismiss.emit(t.id)"
          aria-label="Dismiss">✕</button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-toast-in { animation: toast-in 180ms ease-out both; }
  `],
})
export class Toast {
  @Input() toasts: ToastMessage[] = [];
  @Output() dismiss = new EventEmitter<number>();

  trackId(_: number, t: ToastMessage): number { return t.id; }

  icon(type: ToastType): string {
    return { success: '✓', error: '✕', warning: '▲', info: 'ℹ' }[type];
  }

  styles(type: ToastType): string {
    return {
      success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      error:   'border-red-200 bg-red-50 text-red-800',
      warning: 'border-amber-200 bg-amber-50 text-amber-800',
      info:    'border-blue-200 bg-blue-50 text-[#2a4ccc]',
    }[type];
  }
}

// ── Utility — use in any page component ──────────────────────────────

let _counter = 0;

/**
 * Pushes a new toast and schedules auto-removal.
 *
 * @param toasts  the current toasts array (from component state)
 * @param type    success | error | warning | info
 * @param message display string
 * @param removeFn  callback that removes a toast by id (e.g. removeToast)
 * @param duration  ms before auto-dismiss (default 3000)
 * @returns new toasts array (immutable)
 */
export function pushToast(
  toasts: ToastMessage[],
  type: ToastType,
  message: string,
  removeFn: (id: number) => void,
  duration = 3000,
): ToastMessage[] {
  const id = ++_counter;
  setTimeout(() => removeFn(id), duration);
  return [...toasts, { id, type, message, duration }];
}
