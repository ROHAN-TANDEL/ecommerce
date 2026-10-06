import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'view-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left group">
      <!-- Trigger Button -->
      <button
        type="button"
        (click)="toggleOpen($event)"
        [ngClass]="{
          'bg-slate-100 border-slate-300 text-slate-900': isOpen,
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': !isOpen
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        [title]="infoNote || 'Saved views'"
      >
        <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>{{ label }}</span>
        <svg
          class="w-3 h-3 text-slate-400 transition-transform shrink-0"
          [class.rotate-180]="isOpen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Hover Tooltip -->
      <div
        *ngIf="infoNote && !isOpen"
        class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[120] whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white shadow-md"
      >
        {{ infoNote }}
      </div>

      <!-- Saved Views Popover -->
      <div
        *ngIf="isOpen"
        [ngClass]="dropdownAlign === 'right' ? 'right-0' : 'left-0'"
        class="absolute top-full mt-1.5 z-[110] w-52 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-2 shadow-2xl space-y-0.5 max-h-[calc(100vh-100px)] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
          SAVED VIEWS
        </div>

        <button
          type="button"
          (click)="onSelect('default_view')"
          class="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <span class="text-blue-600 font-bold text-xs leading-none">✓</span>
          <span class="font-medium">Default</span>
        </button>

        <button
          type="button"
          (click)="onSelect('current_view')"
          class="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <span class="text-slate-400 text-sm leading-none font-medium">+</span>
          <span class="font-medium">Save current view</span>
        </button>

        <button
          type="button"
          (click)="onSelect('reset_view')"
          class="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4" />
          </svg>
          <span class="font-medium">Reset view</span>
        </button>
      </div>
    </div>
  `,
})
export class ViewComponent {
  @Input() label = 'View';
  @Input() infoNote?: string;
  @Output() viewSelect = new EventEmitter<string>();

  isOpen = false;
  dropdownAlign: 'left' | 'right' = 'left';

  constructor(private readonly elRef: ElementRef) {}

  toggleOpen(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.isOpen) {
      const rect = this.elRef.nativeElement.getBoundingClientRect();
      const menuWidth = 220;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      this.dropdownAlign = (spaceRight < menuWidth && spaceLeft >= spaceRight) ? 'right' : 'left';
    }
    this.isOpen = !this.isOpen;
  }

  onSelect(viewKey: string): void {
    this.isOpen = false;
    this.viewSelect.emit(viewKey);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}
