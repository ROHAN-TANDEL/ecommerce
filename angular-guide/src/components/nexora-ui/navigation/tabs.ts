import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'nexora-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getContainerClass()">
      <nav class="flex gap-1" [class.border-b]="variant === 'underline'" [class.border-[#EAECF0]]="variant === 'underline'">
        <button
          *ngFor="let tab of tabs"
          type="button"
          [disabled]="tab.disabled"
          (click)="selectTab(tab.id)"
          class="relative flex items-center gap-2 py-2.5 px-3.5 text-xs font-semibold transition-all cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
          [ngClass]="getTabClass(tab.id)"
        >
          <span *ngIf="tab.icon" class="text-xs">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span
            *ngIf="tab.badge !== undefined"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            [ngClass]="getBadgeClass(tab.id)"
          >
            {{ tab.badge }}
          </span>

          <!-- Underline Indicator -->
          <div
            *ngIf="variant === 'underline' && tab.id === activeId"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#436CF3]"
          ></div>
        </button>
      </nav>
    </div>
  `
})
export class NexoraTabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeId = '';
  @Input() variant: 'underline' | 'pills' | 'boxed' = 'underline';

  @Output() activeIdChange = new EventEmitter<string>();

  selectTab(id: string): void {
    this.activeId = id;
    this.activeIdChange.emit(this.activeId);
  }

  getContainerClass(): string {
    if (this.variant === 'boxed') {
      return 'p-1 bg-[#F2F4F7] rounded-xl inline-flex';
    }
    return 'w-full';
  }

  getTabClass(id: string): string {
    const isActive = id === this.activeId;

    if (this.variant === 'underline') {
      return isActive
        ? 'text-[#436CF3]'
        : 'text-[#667085] hover:text-[#344054]';
    }

    if (this.variant === 'pills') {
      return isActive
        ? 'bg-[#EFF4FF] text-[#436CF3] rounded-lg'
        : 'text-[#667085] hover:text-[#344054] hover:bg-[#F9FAFB] rounded-lg';
    }

    if (this.variant === 'boxed') {
      return isActive
        ? 'bg-white text-[#101828] shadow-xs rounded-lg'
        : 'text-[#667085] hover:text-[#344054] rounded-lg';
    }

    return '';
  }

  getBadgeClass(id: string): string {
    const isActive = id === this.activeId;
    if (isActive) {
      return 'bg-[#EFF4FF] text-[#436CF3]';
    }
    return 'bg-[#F2F4F7] text-[#667085]';
  }
}
