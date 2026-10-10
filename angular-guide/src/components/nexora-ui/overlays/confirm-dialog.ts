import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" (click)="close()"></div>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#EAECF0] p-6 animate-in zoom-in-95 duration-150">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              [class.bg-[#FEF3F2]]="variant === 'danger'"
              [class.text-[#F04438]]="variant === 'danger'"
              [class.bg-[#FEF0C7]]="variant === 'warning'"
              [class.text-[#F79009]]="variant === 'warning'"
              [class.bg-[#EFF4FF]]="variant === 'primary'"
              [class.text-[#436CF3]]="variant === 'primary'"
            >
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1">
              <h4 class="text-sm font-bold text-[#101828]">{{ title }}</h4>
              <p class="text-xs text-[#667085] mt-1.5 leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="cancel()"
              class="h-8 px-3.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F2F4F7] transition-all cursor-pointer shadow-xs"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              (click)="confirm()"
              class="h-8 px-4 rounded-lg text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              [class.bg-[#F04438]]="variant === 'danger'"
              [class.hover:bg-[#D92D20]]="variant === 'danger'"
              [class.bg-[#F79009]]="variant === 'warning'"
              [class.hover:bg-[#DC6803]]="variant === 'warning'"
              [class.bg-[#436CF3]]="variant === 'primary'"
              [class.hover:bg-[#3459D9]]="variant === 'primary'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NexoraConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to perform this operation? This action cannot be undone.';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'primary' = 'danger';

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  confirm(): void {
    this.confirmed.emit();
    this.close();
  }
}
