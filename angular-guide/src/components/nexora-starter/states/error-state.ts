import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-rose-50/60 border border-rose-200 rounded-xl text-center flex flex-col items-center">
      <div class="w-12 h-12 mb-3 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div class="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
        Error {{ code ? '(' + code + ')' : '' }}
      </div>
      <h3 class="text-base font-semibold text-slate-900 mb-1">{{ message }}</h3>
      <p class="text-xs text-slate-500 max-w-sm mb-4">{{ suggestion }}</p>

      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="retry.emit()"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry request
        </button>

        @if (details) {
          <button
            type="button"
            (click)="showDetails = !showDetails"
            class="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
          >
            {{ showDetails ? 'Hide details' : 'Show details' }}
          </button>
        }
      </div>

      @if (showDetails && details) {
        <pre class="mt-4 p-3 bg-slate-900 text-slate-200 text-left text-xs font-mono rounded-lg w-full max-w-md overflow-x-auto select-all">
          {{ details }}
        </pre>
      }
    </div>
  `
})
export class NexoraErrorStateComponent {
  @Input() message = 'Failed to load remote dataset';
  @Input() code = '500';
  @Input() suggestion = 'An unexpected server error occurred while retrieving this record. Please retry shortly.';
  @Input() details = '';
  @Output() retry = new EventEmitter<void>();

  showDetails = false;
}

@Component({
  selector: 'nexora-offline-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9.003 9.003 0 01-2.829-2.829M3 3l18 18" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-amber-900">Working Offline</h4>
          <p class="text-xs text-amber-700">You are currently disconnected. Changes will be saved locally and queued for automatic sync.</p>
        </div>
      </div>

      <button
        type="button"
        (click)="checkConnection.emit()"
        class="shrink-0 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
      >
        Recheck Connection
      </button>
    </div>
  `
})
export class NexoraOfflineStateComponent {
  @Output() checkConnection = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl min-h-[160px]">
      <div class="relative w-10 h-10 mb-3">
        <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-slate-800 mb-1">{{ label }}</p>
      @if (subtext) {
        <p class="text-xs text-slate-400 mb-3">{{ subtext }}</p>
      }

      @if (canCancel) {
        <button
          type="button"
          (click)="cancel.emit()"
          class="text-xs text-slate-500 hover:text-rose-600 underline transition-colors"
        >
          Cancel operation
        </button>
      }
    </div>
  `
})
export class NexoraLoadingStateComponent {
  @Input() label = 'Loading records...';
  @Input() subtext = 'Fetching the latest data from the cluster';
  @Input() canCancel = false;
  @Output() cancel = new EventEmitter<void>();
}
