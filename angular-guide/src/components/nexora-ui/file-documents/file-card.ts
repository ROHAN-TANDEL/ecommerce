import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-file-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3.5 rounded-xl border border-[#EAECF0] bg-white shadow-xs flex flex-col gap-2">
      <!-- File Details -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#436CF3] flex items-center justify-center text-sm font-bold shrink-0">
            📄
          </div>
          <div class="truncate">
            <h5 class="text-xs font-semibold text-[#101828] truncate">{{ name }}</h5>
            <span class="text-[10px] text-[#667085]">{{ size }}</span>
          </div>
        </div>

        <button
          *ngIf="removable"
          type="button"
          (click)="removed.emit()"
          class="text-[#98A2B3] hover:text-[#B42318] p-0.5 focus:outline-none cursor-pointer shrink-0"
        >
          &times;
        </button>
      </div>

      <!-- Upload Progress Bar -->
      <div *ngIf="progress !== undefined" class="space-y-1">
        <div class="flex items-center justify-between text-[10px] font-semibold text-[#475467]">
          <span>{{ statusText || (progress === 100 ? 'Completed' : 'Uploading...') }}</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full h-1.5 bg-[#EAECF0] rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            [style.width.%]="progress"
            [class.bg-[#12B76A]]="progress === 100"
            [class.bg-[#436CF3]]="progress < 100"
          ></div>
        </div>
      </div>
    </div>
  `
})
export class NexoraFileCardComponent {
  @Input() name = 'invoice-2026.pdf';
  @Input() size = '2.4 MB';
  @Input() progress?: number = 82;
  @Input() statusText = '';
  @Input() removable = true;

  @Output() removed = new EventEmitter<void>();
}
