import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-currency-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="colorClasses"
      class="inline-flex items-baseline font-mono font-medium tracking-tight text-sm select-all"
    >
      <span class="text-xs mr-0.5 opacity-80">{{ symbol }}</span>
      <span>{{ formattedInteger }}</span>
      @if (formattedDecimal) {
        <span class="text-xs opacity-75">.{{ formattedDecimal }}</span>
      }
      @if (showTrend) {
        <span class="ml-1 text-xs" [class.text-emerald-600]="amount > 0" [class.text-rose-600]="amount < 0">
          {{ amount >= 0 ? '↑' : '↓' }}
        </span>
      }
    </span>
  `
})
export class NexoraCurrencyDisplayComponent {
  @Input() amount = 0;
  @Input() currency = 'INR'; // INR, USD, EUR, GBP
  @Input() colored = false;
  @Input() showTrend = false;

  get symbol(): string {
    switch (this.currency.toUpperCase()) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return this.currency;
    }
  }

  get formattedInteger(): string {
    const absVal = Math.abs(this.amount);
    const intPart = Math.floor(absVal);
    const prefix = this.amount < 0 ? '-' : '';
    return prefix + intPart.toLocaleString();
  }

  get formattedDecimal(): string {
    const absVal = Math.abs(this.amount);
    const dec = (absVal % 1).toFixed(2).split('.')[1];
    return dec || '00';
  }

  get colorClasses(): string {
    if (!this.colored) return 'text-slate-900';
    if (this.amount > 0) return 'text-emerald-700 font-semibold';
    if (this.amount < 0) return 'text-rose-700 font-semibold';
    return 'text-slate-600';
  }
}

@Component({
  selector: 'nexora-percentage-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="variantClasses"
      class="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-full select-all"
    >
      <span>{{ prefix }}{{ Math.abs(value).toFixed(decimals) }}%</span>
    </span>
  `
})
export class NexoraPercentageDisplayComponent {
  @Input() value = 0;
  @Input() decimals = 1;
  @Input() asBadge = true;

  Math = Math;

  get prefix(): string {
    if (this.value > 0) return '+';
    if (this.value < 0) return '-';
    return '';
  }

  get variantClasses(): string {
    if (!this.asBadge) {
      if (this.value > 0) return 'text-emerald-600 font-bold';
      if (this.value < 0) return 'text-rose-600 font-bold';
      return 'text-slate-500 font-medium';
    }

    if (this.value > 0) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (this.value < 0) {
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    } else {
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }
}

@Component({
  selector: 'nexora-masked-value',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5 font-mono text-xs text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200">
      <span>{{ isRevealed ? rawValue : maskedText }}</span>

      <button
        type="button"
        (click)="isRevealed = !isRevealed"
        class="text-slate-400 hover:text-slate-700 transition-colors ml-1 p-0.5"
        [title]="isRevealed ? 'Hide value' : 'Show value'"
      >
        @if (isRevealed) {
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
        } @else {
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.477 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26a4 4 0 015.657 5.658l-5.657-5.658zm6.586 7.999L11.75 11.75a2 2 0 00-2.828-2.828l-2.804-2.804a9.98 9.98 0 00-5.66 3.882c1.274 4.057 5.064 7 9.542 7 1.83 0 3.543-.497 5.006-1.37z" clip-rule="evenodd" />
          </svg>
        }
      </button>

      @if (copyable) {
        <button
          type="button"
          (click)="copyRaw()"
          class="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
          title="Copy full value"
        >
          @if (copied) {
            <span class="text-[10px] text-emerald-600 font-sans font-bold">✓</span>
          } @else {
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 2H9a3 3 0 01-3-2z"/>
            </svg>
          }
        </button>
      }
    </div>
  `
})
export class NexoraMaskedValueComponent {
  @Input() rawValue = '4821882910484821';
  @Input() visibleTrailing = 4;
  @Input() maskChar = '•';
  @Input() copyable = true;

  isRevealed = false;
  copied = false;

  get maskedText(): string {
    if (!this.rawValue) return '';
    const trailing = this.rawValue.slice(-this.visibleTrailing);
    return `${this.maskChar.repeat(4)} ${this.maskChar.repeat(4)} ${trailing}`;
  }

  copyRaw() {
    if (this.rawValue && navigator?.clipboard) {
      navigator.clipboard.writeText(this.rawValue);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }
  }
}

@Component({
  selector: 'nexora-reference-number',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5">
      <span class="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 select-all tracking-wider">
        {{ value }}
      </span>

      @if (copyable) {
        <button
          type="button"
          (click)="copyRef()"
          class="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded hover:bg-slate-100"
          title="Copy reference"
        >
          @if (copied) {
            <span class="text-[10px] text-emerald-600 font-sans font-bold">✓</span>
          } @else {
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 2H9a3 3 0 01-3-2z"/>
            </svg>
          }
        </button>
      }
    </div>
  `
})
export class NexoraReferenceNumberComponent {
  @Input() value = 'TXN-98421-2026';
  @Input() copyable = true;

  copied = false;

  copyRef() {
    if (this.value && navigator?.clipboard) {
      navigator.clipboard.writeText(this.value);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }
  }
}
