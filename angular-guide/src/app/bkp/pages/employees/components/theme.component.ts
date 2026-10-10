import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TableTheme = 'light' | 'dark' | 'colorful' | 'grey';

@Component({
  selector: 'theme-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left group">
      <button
        type="button"
        (click)="toggleOpen($event)"
        [ngClass]="{
          'bg-slate-100 border-slate-300 text-slate-900': isOpen,
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': !isOpen
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        [title]="infoNote || 'Themes'"
      >
        <svg class="w-3.5 h-3.5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span>{{ label }}</span>
        <span class="text-[10px] text-slate-400 capitalize">({{ theme }})</span>
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

      <!-- Dropdown Popover (Never clipped, z-[100]) -->
      <div
        *ngIf="isOpen"
        [ngClass]="dropdownAlign === 'right' ? 'right-0' : 'left-0'"
        class="absolute top-full mt-1.5 z-[100] w-44 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5 whitespace-nowrap max-h-[calc(100vh-100px)] overflow-y-auto"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400">
          Themes
        </div>
        <button
          *ngFor="let opt of options"
          type="button"
          (click)="selectTheme(opt.value)"
          [ngClass]="{
            'bg-slate-100 font-semibold text-slate-900': theme === opt.value,
            'text-slate-700 hover:bg-slate-50': theme !== opt.value
          }"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-left"
        >
          <div>
            <span class="capitalize">{{ opt.label }}</span>
            <div *ngIf="opt.note" class="text-[10px] text-slate-400 font-normal">{{ opt.note }}</div>
          </div>
          <span *ngIf="theme === opt.value" class="text-xs font-bold text-blue-600">✓</span>
        </button>
      </div>
    </div>
  `,
})
export class ThemeComponent {
  @Input() label?: string = 'Themes';
  @Input() infoNote?: string = 'set themes';
  @Input() theme: TableTheme = 'light';
  @Output() themeChange = new EventEmitter<TableTheme>();

  isOpen = false;
  dropdownAlign: 'left' | 'right' = 'left';

  readonly options: { value: TableTheme; label: string; note: string }[] = [
    { value: 'light', label: 'Light', note: 'add light theme' },
    { value: 'dark', label: 'Dark', note: 'add dark theme' },
    { value: 'colorful', label: 'colorful', note: 'add colorful theme' },
    { value: 'grey', label: 'grey', note: 'add grey them' },
  ];

  readonly menuId = 'theme_' + Math.random().toString(36).substring(2, 9);

  constructor(private readonly elRef: ElementRef) {}

  toggleOpen(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.isOpen) {
      const rect = this.elRef.nativeElement.getBoundingClientRect();
      const menuWidth = 190;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      this.dropdownAlign = (spaceRight < menuWidth && spaceLeft >= spaceRight) ? 'right' : 'left';
      document.dispatchEvent(new CustomEvent('nexora:menu-open', { detail: this.menuId }));
    }
    this.isOpen = !this.isOpen;
  }

  selectTheme(val: TableTheme): void {
    this.theme = val;
    this.themeChange.emit(val);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:nexora:menu-open', ['$event'])
  onCoordinatedMenuOpen(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (detail !== this.menuId) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}
