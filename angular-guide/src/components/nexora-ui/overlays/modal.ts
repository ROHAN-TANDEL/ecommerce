import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        (click)="onBackdropClick()"
      ></div>

      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative w-full rounded-2xl bg-white shadow-2xl transition-all border border-[#EAECF0] animate-in zoom-in-95 duration-200"
          [ngClass]="getSizeClass()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-[#EAECF0]">
            <div>
              <h3 class="text-sm font-bold text-[#101828]">{{ title }}</h3>
              <p *ngIf="subtitle" class="text-xs text-[#667085] mt-0.5">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              (click)="close()"
              class="w-7 h-7 rounded-lg text-[#98A2B3] hover:text-[#344054] hover:bg-[#F2F4F7] flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto text-xs text-[#344054]">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div *ngIf="showFooter" class="px-6 py-3.5 bg-[#F9FAFB] rounded-b-2xl border-t border-[#EAECF0] flex items-center justify-end gap-2.5">
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
              class="h-8 px-4 rounded-lg bg-[#436CF3] hover:bg-[#3459D9] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NexoraModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal Title';
  @Input() subtitle = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showFooter = true;
  @Input() cancelText = 'Cancel';
  @Input() confirmText = 'Save Changes';
  @Input() closeOnBackdrop = true;

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
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  getSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'md':
      default:
        return 'max-w-lg';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }
}
