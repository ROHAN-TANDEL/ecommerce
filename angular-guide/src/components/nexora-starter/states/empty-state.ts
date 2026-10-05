import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <div class="w-14 h-14 mb-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
        @if (icon) {
          <span class="text-2xl">{{ icon }}</span>
        } @else {
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        }
      </div>

      <h3 class="text-base font-semibold text-slate-900 mb-1">{{ title }}</h3>
      <p class="text-sm text-slate-500 max-w-sm mb-6">{{ description }}</p>

      @if (actionLabel) {
        <button
          type="button"
          (click)="action.emit()"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <span>{{ actionLabel }}</span>
        </button>
      }
    </div>
  `
})
export class NexoraEmptyStateComponent {
  @Input() title = 'No data available';
  @Input() description = 'Get started by creating your first entry or importing existing records.';
  @Input() icon = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-no-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-xl">
      <div class="w-12 h-12 mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <h4 class="text-sm font-semibold text-slate-900 mb-1">
        No matches for "{{ searchQuery || 'your filter' }}"
      </h4>
      <p class="text-xs text-slate-500 max-w-xs mb-4">
        Try checking for spelling errors, clearing active filters, or searching for a different keyword.
      </p>

      @if (showReset) {
        <button
          type="button"
          (click)="reset.emit()"
          class="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
        >
          Clear all filters
        </button>
      }
    </div>
  `
})
export class NexoraNoResultsComponent {
  @Input() searchQuery = '';
  @Input() showReset = true;
  @Output() reset = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-no-permission',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-8 bg-rose-50/40 border border-rose-200 rounded-xl">
      <div class="w-12 h-12 mb-3 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <span class="px-2 py-0.5 mb-2 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 rounded-md">
        403 • Access Denied
      </span>
      <h4 class="text-sm font-semibold text-slate-900 mb-1">{{ title }}</h4>
      <p class="text-xs text-slate-600 max-w-sm mb-5">{{ description }}</p>

      @if (requestAccessLabel) {
        <button
          type="button"
          (click)="requestAccess.emit()"
          class="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
        >
          {{ requestAccessLabel }}
        </button>
      }
    </div>
  `
})
export class NexoraNoPermissionComponent {
  @Input() title = 'You don’t have permission to view this resource';
  @Input() description = 'Your current organization role (Viewer) restricts access to sensitive financials. Contact your workspace administrator to request access.';
  @Input() requestAccessLabel = 'Request Access';
  @Output() requestAccess = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-slate-200 rounded-xl">
      <span class="text-4xl font-extrabold text-slate-300 tracking-widest mb-1">404</span>
      <h4 class="text-sm font-semibold text-slate-800 mb-1">{{ title }}</h4>
      <p class="text-xs text-slate-500 max-w-xs mb-4">{{ description }}</p>

      <button
        type="button"
        (click)="goBack.emit()"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 transition-colors"
      >
        <span>← Back to previous view</span>
      </button>
    </div>
  `
})
export class NexoraNotFoundComponent {
  @Input() title = 'Resource not found';
  @Input() description = 'The item you are looking for might have been deleted, archived, or moved.';
  @Output() goBack = new EventEmitter<void>();
}
