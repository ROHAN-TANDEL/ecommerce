import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-icon-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative inline-block">
      <!-- Icon Trigger -->
      <button
        type="button"
        [disabled]="disabled"
        (click)="toggleMenu($event)"
        class="h-9 px-3 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] flex items-center gap-2 text-xs font-semibold text-[#1D2939] shadow-xs cursor-pointer disabled:opacity-40"
      >
        <span class="text-base">{{ selectedIcon || '✨' }}</span>
        <span class="text-[11px] text-[#667085]">{{ label || 'Choose Icon' }}</span>
        <svg class="w-3.5 h-3.5 text-[#98A2B3] transition-transform" [class.rotate-180]="isOpen" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Icon Palette Dropdown -->
      <div
        *ngIf="isOpen"
        class="absolute left-0 top-[calc(100%+4px)] z-50 w-64 rounded-xl border border-[#EAECF0] bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100"
      >
        <input
          type="text"
          [(ngModel)]="search"
          placeholder="Filter icons..."
          class="w-full h-7 px-2.5 rounded-md border border-[#D0D5DD] text-xs mb-2 outline-none focus:border-[#436CF3]"
        />

        <div class="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-0.5">
          <button
            *ngFor="let ic of filteredIcons"
            type="button"
            (click)="selectIcon(ic)"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-[#EFF4FF] hover:text-[#436CF3] transition-all cursor-pointer"
            [class.bg-[#EFF4FF]]="ic === selectedIcon"
            [class.ring-2]="ic === selectedIcon"
            [class.ring-[#436CF3]]="ic === selectedIcon"
          >
            {{ ic }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class NexoraIconSelectorComponent {
  @Input() selectedIcon = '📊';
  @Input() label = '';
  @Input() disabled = false;
  @Input() icons: string[] = [
    '📊', '📈', '📉', '💰', '🛡', '⚙', '👥', '🔑', '🚀', '📝', '✨', '⚡',
    '🔔', '📅', '🔍', '📁', '📦', '🏷', '💬', '🔒', '✉', '🌐', '💻', '💡'
  ];

  @Output() selectedIconChange = new EventEmitter<string>();

  isOpen = false;
  search = '';

  constructor(private el: ElementRef) {}

  get filteredIcons(): string[] {
    return this.icons;
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  selectIcon(ic: string): void {
    this.selectedIcon = ic;
    this.selectedIconChange.emit(this.selectedIcon);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
