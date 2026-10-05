import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'nexora-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="p-3.5 rounded-xl border border-[#EAECF0] bg-white shadow-xl flex items-start gap-3 w-80 animate-in slide-in-from-bottom-5 duration-200"
    >
      <!-- Dot or Icon -->
      <div
        class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        [ngClass]="getIconBg()"
      >
        <span class="text-xs">{{ getIcon() }}</span>
      </div>

      <div class="flex-1 min-w-0">
        <h5 class="text-xs font-semibold text-[#101828] leading-tight mb-0.5 truncate">{{ title }}</h5>
        <p class="text-[11px] text-[#667085] leading-relaxed line-clamp-2">{{ message }}</p>
      </div>

      <button
        type="button"
        (click)="close()"
        class="text-[#98A2B3] hover:text-[#344054] p-0.5 focus:outline-none cursor-pointer shrink-0"
      >
        &times;
      </button>
    </div>
  `
})
export class NexoraToastComponent {
  @Input() type: ToastType = 'success';
  @Input() title = '';
  @Input() message = '';
  @Input() visible = true;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.visible = false;
    this.closed.emit();
  }

  getIcon(): string {
    switch (this.type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  }

  getIconBg(): string {
    switch (this.type) {
      case 'success': return 'bg-[#ECFDF3] text-[#12B76A]';
      case 'error': return 'bg-[#FEF3F2] text-[#F04438]';
      case 'warning': return 'bg-[#FEF0C7] text-[#F79009]';
      case 'info': return 'bg-[#EFF4FF] text-[#2E90FA]';
    }
  }
}
