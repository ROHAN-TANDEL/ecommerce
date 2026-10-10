import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="w-full px-4 py-2.5 bg-[#1E293B] text-white text-xs flex items-center justify-between gap-4 shadow-sm"
    >
      <div class="flex items-center gap-2.5 truncate">
        <span *ngIf="badge" class="px-2 py-0.5 rounded-full bg-[#436CF3] text-white text-[10px] font-bold tracking-wide uppercase shrink-0">
          {{ badge }}
        </span>
        <span class="truncate text-slate-200">{{ message }}</span>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button
          *ngIf="actionLabel"
          type="button"
          (click)="actionClicked.emit()"
          class="font-semibold text-[#38BDF8] hover:text-white hover:underline transition-colors cursor-pointer"
        >
          {{ actionLabel }} &rarr;
        </button>

        <button
          type="button"
          (click)="visible = false"
          class="text-slate-400 hover:text-white p-0.5 focus:outline-none cursor-pointer"
        >
          &times;
        </button>
      </div>
    </div>
  `
})
export class NexoraBannerComponent {
  @Input() badge = '';
  @Input() message = '';
  @Input() actionLabel = '';

  @Output() actionClicked = new EventEmitter<void>();

  visible = true;
}
