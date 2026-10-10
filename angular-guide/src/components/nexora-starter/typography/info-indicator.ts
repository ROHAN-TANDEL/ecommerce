import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-info-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center group">
      <button
        type="button"
        [class]="indicatorClasses"
        (click)="togglePopover()"
        aria-label="More information"
      >
        @if (type === 'help') {
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
        } @else if (type === 'warning') {
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        } @else {
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
        }
      </button>

      <!-- Hover / Active Tooltip -->
      @if (tooltipText) {
        <div
          [class]="tooltipPositionClasses"
          class="absolute z-30 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md shadow-lg whitespace-normal max-w-xs w-max"
        >
          {{ tooltipText }}
        </div>
      }
    </div>
  `
})
export class NexoraInfoIndicatorComponent {
  @Input() tooltipText = '';
  @Input() type: 'info' | 'help' | 'warning' = 'info';
  @Input() size: 'sm' | 'md' = 'sm';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  isOpen = false;

  togglePopover() {
    this.isOpen = !this.isOpen;
  }

  get indicatorClasses(): string {
    const base = 'inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ';
    const sizeMap = {
      sm: 'w-4 h-4 ',
      md: 'w-5 h-5 '
    };
    const typeMap = {
      info: 'text-slate-400 hover:text-slate-600 focus:ring-blue-500',
      help: 'text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500',
      warning: 'text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 focus:ring-amber-500'
    };
    return base + (sizeMap[this.size] || sizeMap.sm) + (typeMap[this.type] || typeMap.info);
  }

  get tooltipPositionClasses(): string {
    switch (this.position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  }
}

@Component({
  selector: 'nexora-metadata-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-sm gap-4">
      <div class="flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
        @if (icon) {
          <span class="text-slate-400">{{ icon }}</span>
        }
        <span>{{ label }}</span>
        @if (info) {
          <span class="text-xs text-slate-400 cursor-help" [title]="info">ℹ️</span>
        }
      </div>

      <div class="flex items-center gap-2 overflow-hidden text-right">
        @if (badge) {
          <span
            [class]="badgeClasses"
            class="px-2 py-0.5 text-xs font-medium rounded-full shrink-0"
          >
            {{ value }}
          </span>
        } @else {
          <span class="text-slate-900 font-medium truncate select-all">{{ value }}</span>
        }

        @if (copyable) {
          <button
            type="button"
            (click)="copyValue()"
            class="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors"
            title="Copy to clipboard"
          >
            @if (copied) {
              <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            } @else {
              <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 2H9a3 3 0 01-3-2z"/>
              </svg>
            }
          </button>
        }
      </div>
    </div>
  `
})
export class NexoraMetadataRowComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() icon = '';
  @Input() info = '';
  @Input() badge = false;
  @Input() badgeVariant: 'success' | 'warning' | 'info' | 'danger' | 'neutral' = 'neutral';
  @Input() copyable = false;

  copied = false;

  get badgeClasses(): string {
    const map = {
      success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border border-amber-200',
      info: 'bg-blue-50 text-blue-700 border border-blue-200',
      danger: 'bg-rose-50 text-rose-700 border border-rose-200',
      neutral: 'bg-slate-100 text-slate-700 border border-slate-200'
    };
    return map[this.badgeVariant] || map.neutral;
  }

  copyValue() {
    if (this.value && navigator?.clipboard) {
      navigator.clipboard.writeText(this.value);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }
  }
}
