import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-cell-customer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3">
      <!-- Avatar -->
      @if (avatarUrl) {
        <img [src]="avatarUrl" [alt]="name" class="w-8 h-8 rounded-full object-cover border border-[#EAECF0]" />
      } @else {
        <div
          [class]="avatarBg || 'bg-[#EFF4FF] text-[#436CF3]'"
          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none border border-[#EAECF0]"
        >
          {{ initials }}
        </div>
      }

      <!-- Name & Email -->
      <div class="flex flex-col min-w-0">
        <span class="text-xs font-semibold text-[#101828] truncate hover:text-[#436CF3] cursor-pointer">
          {{ name }}
        </span>
        @if (email) {
          <span class="text-[11px] text-[#667085] truncate">{{ email }}</span>
        }
      </div>
    </div>
  `
})
export class MasterCellCustomerComponent {
  @Input() name = '';
  @Input() email = '';
  @Input() avatarUrl?: string;
  @Input() avatarBg?: string;

  get initials(): string {
    if (!this.name) return '??';
    return this.name
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}

@Component({
  selector: 'nexora-cell-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="statusClasses"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none"
    >
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass"></span>
      <span>{{ label || status }}</span>
    </span>
  `
})
export class MasterCellStatusBadgeComponent {
  @Input() status = 'Active';
  @Input() label?: string;

  get statusClasses(): string {
    switch (this.status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
        return 'bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]';
      case 'pending':
      case 'in_progress':
        return 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]';
      case 'suspended':
      case 'critical':
      case 'failed':
        return 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]';
      case 'inactive':
      case 'archived':
      default:
        return 'bg-[#F2F4F7] text-[#344054] border border-[#EAECF0]';
    }
  }

  get dotClass(): string {
    switch (this.status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
        return 'bg-[#12B76A]';
      case 'pending':
      case 'in_progress':
        return 'bg-[#F79009]';
      case 'suspended':
      case 'critical':
      case 'failed':
        return 'bg-[#F04438]';
      case 'inactive':
      default:
        return 'bg-[#667085]';
    }
  }
}

@Component({
  selector: 'nexora-cell-revenue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-baseline gap-1 font-mono text-xs font-semibold text-[#101828]">
      <span>{{ formattedAmount }}</span>
      @if (growthPercent !== undefined) {
        <span
          [class]="growthPercent >= 0 ? 'text-[#027A48]' : 'text-[#B42318]'"
          class="text-[10px] font-sans"
        >
          {{ growthPercent >= 0 ? '↑' : '↓' }}{{ Math.abs(growthPercent) }}%
        </span>
      }
    </div>
  `
})
export class MasterCellRevenueComponent {
  @Input() amount = 0;
  @Input() currency = 'INR';
  @Input() growthPercent?: number;

  Math = Math;

  get formattedAmount(): string {
    const symbol = this.currency === 'INR' ? '₹' : this.currency === 'USD' ? '$' : this.currency === 'EUR' ? '€' : '£';
    return `${symbol}${this.amount.toLocaleString()}`;
  }
}

@Component({
  selector: 'nexora-cell-health-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2.5 min-w-[120px]">
      <div class="w-full bg-[#EAECF0] rounded-full h-1.5 overflow-hidden">
        <div
          [class]="barColor"
          [style.width.%]="clampedPercent"
          class="h-full rounded-full transition-all duration-300"
        ></div>
      </div>
      <span class="text-xs font-mono font-medium text-[#475467] shrink-0">{{ clampedPercent }}%</span>
    </div>
  `
})
export class MasterCellHealthProgressComponent {
  @Input() value = 75;

  get clampedPercent(): number {
    return Math.min(100, Math.max(0, this.value));
  }

  get barColor(): string {
    if (this.clampedPercent >= 80) return 'bg-[#12B76A]';
    if (this.clampedPercent >= 50) return 'bg-[#436CF3]';
    if (this.clampedPercent >= 25) return 'bg-[#F79009]';
    return 'bg-[#F04438]';
  }
}

@Component({
  selector: 'nexora-cell-tags-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1.5 flex-wrap">
      @for (tag of visibleTags; track tag) {
        <span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F2F4F7] text-[#344054] border border-[#EAECF0]">
          {{ tag }}
        </span>
      }
      @if (remainingCount > 0) {
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF4FF] text-[#436CF3]" [title]="tags.slice(maxVisible).join(', ')">
          +{{ remainingCount }}
        </span>
      }
    </div>
  `
})
export class MasterCellTagsGroupComponent {
  @Input() tags: string[] = [];
  @Input() maxVisible = 2;

  get visibleTags(): string[] {
    return this.tags.slice(0, this.maxVisible);
  }

  get remainingCount(): number {
    return Math.max(0, this.tags.length - this.maxVisible);
  }
}

@Component({
  selector: 'nexora-cell-actions-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-end">
      <button
        type="button"
        (click)="isOpen = !isOpen"
        class="w-7 h-7 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] flex items-center justify-center transition-colors cursor-pointer"
        title="More actions"
      >
        ⋮
      </button>

      @if (isOpen) {
        <div class="absolute right-0 top-full mt-1 w-36 bg-white border border-[#D0D5DD] rounded-xl shadow-lg z-30 p-1 space-y-0.5 text-xs text-left">
          <button
            type="button"
            (click)="action('view')"
            class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F9FAFB] text-[#344054] font-medium cursor-pointer"
          >
            👁️ View Details
          </button>
          <button
            type="button"
            (click)="action('edit')"
            class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F9FAFB] text-[#344054] font-medium cursor-pointer"
          >
            ✏️ Edit Row
          </button>
          <button
            type="button"
            (click)="action('duplicate')"
            class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#F9FAFB] text-[#344054] font-medium cursor-pointer"
          >
            📄 Duplicate
          </button>
          <div class="border-t border-[#F2F4F7] my-0.5"></div>
          <button
            type="button"
            (click)="action('delete')"
            class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#FEF3F2] text-[#B42318] font-semibold cursor-pointer"
          >
            🗑️ Delete Row
          </button>
        </div>
      }
    </div>
  `
})
export class MasterCellActionsDropdownComponent {
  @Output() actionSelect = new EventEmitter<string>();

  isOpen = false;

  action(actionName: string) {
    this.isOpen = false;
    this.actionSelect.emit(actionName);
  }
}
