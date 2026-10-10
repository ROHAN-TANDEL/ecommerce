import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2">
      <svg
        class="animate-spin text-[#436CF3]"
        [ngClass]="getSizeClass()"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span *ngIf="label" class="text-xs font-medium text-[#667085]">{{ label }}</span>
    </div>
  `
})
export class NexoraSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() label = '';

  getSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-5 h-5';
    }
  }
}

@Component({
  selector: 'nexora-loading-overlay',
  standalone: true,
  imports: [CommonModule, NexoraSpinnerComponent],
  template: `
    <div *ngIf="loading" class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-30 flex flex-col items-center justify-center gap-2 rounded-xl transition-all">
      <nexora-spinner size="lg"></nexora-spinner>
      <span class="text-xs font-semibold text-[#1D2939]">{{ message || 'Loading...' }}</span>
    </div>
  `
})
export class NexoraLoadingOverlayComponent {
  @Input() loading = false;
  @Input() message = 'Loading data...';
}
