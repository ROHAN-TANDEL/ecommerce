import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        (click)="close()"
      ></div>

      <div class="fixed inset-y-0 flex max-w-full" [class.right-0]="position === 'right'" [class.left-0]="position === 'left'">
        <div
          class="w-screen max-w-md bg-white shadow-2xl flex flex-col border-[#EAECF0]"
          [class.border-l]="position === 'right'"
          [class.border-r]="position === 'left'"
        >
          <!-- Drawer Header -->
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

          <!-- Drawer Content -->
          <div class="flex-1 px-6 py-4 overflow-y-auto text-xs text-[#344054]">
            <ng-content></ng-content>
          </div>

          <!-- Drawer Footer -->
          <div *ngIf="showFooter" class="px-6 py-3.5 bg-[#F9FAFB] border-t border-[#EAECF0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              (click)="close()"
              class="h-8 px-3.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F2F4F7] cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="save.emit()"
              class="h-8 px-4 rounded-lg bg-[#436CF3] hover:bg-[#3459D9] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NexoraDrawerComponent {
  @Input() isOpen = false;
  @Input() title = 'Side Panel';
  @Input() subtitle = '';
  @Input() position: 'left' | 'right' = 'right';
  @Input() showFooter = true;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }
}
