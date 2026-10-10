import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionDropdownOption } from '../employees.types';

@Component({
  selector: 'options-dropdown-component',
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
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': !isOpen,
          'w-8 px-0 justify-center': iconOnly,
          'px-3': !iconOnly
        }"
        class="inline-flex h-8 items-center gap-1.5 rounded-lg border text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        [title]="infoNote || label"
      >
        <ng-container [ngSwitch]="actionKey">
          <svg *ngSwitchCase="'export'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <svg *ngSwitchCase="'download'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg *ngSwitchDefault class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
          </svg>
        </ng-container>

        <ng-container *ngIf="!iconOnly">
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
        </ng-container>
      </button>

      <!-- Hover Tooltip -->
      <div
        *ngIf="infoNote && !isOpen"
        class="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[120] whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white shadow-md"
      >
        {{ infoNote }}
      </div>

      <!-- Popover Menu -->
      <div
        *ngIf="isOpen"
        [ngClass]="[
          dropdownAlign === 'right' ? 'right-0' : 'left-0',
          menuVAlign === 'bottom' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        ]"
        class="absolute z-[110] w-52 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5 whitespace-nowrap max-h-[calc(100vh-100px)] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400 border-b border-slate-100 mb-1">
          {{ label }} Options
        </div>

        <button
          *ngFor="let opt of options | keyvalue"
          type="button"
          (click)="onSelect(opt.key)"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <div>
            <div class="font-medium">{{ opt.value.display_name }}</div>
            <div *ngIf="opt.value.info_note" class="text-[10px] text-slate-400">
              {{ opt.value.info_note }}
            </div>
          </div>
        </button>
      </div>
    </div>
  `,
})
export class OptionsDropdownComponent {
  @Input() label = 'Options';
  @Input() actionKey = 'export';
  @Input() infoNote?: string;
  @Input() options: Record<string, ActionDropdownOption> = {};
  @Input() iconOnly = false;
  @Output() optionSelect = new EventEmitter<{ actionKey: string; optionKey: string }>();

  readonly menuId = 'opt_' + Math.random().toString(36).substring(2, 9);
  isOpen = false;
  dropdownAlign: 'left' | 'right' = 'left';
  menuVAlign: 'top' | 'bottom' = 'top';

  constructor(private readonly elRef: ElementRef) {}

  toggleOpen(e: MouseEvent): void {
    if (!this.isOpen) {
      const rect = this.elRef.nativeElement.getBoundingClientRect();
      const menuWidth = 220;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      this.dropdownAlign = (spaceRight < menuWidth && spaceLeft >= spaceRight) ? 'right' : 'left';

      const spaceBottom = window.innerHeight - rect.bottom;
      this.menuVAlign = (spaceBottom < 220 && rect.top >= spaceBottom) ? 'bottom' : 'top';
      document.dispatchEvent(new CustomEvent('nexora:menu-open', { detail: this.menuId }));
    }
    this.isOpen = !this.isOpen;
  }

  onSelect(optKey: string): void {
    this.isOpen = false;
    this.optionSelect.emit({ actionKey: this.actionKey, optionKey: optKey });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:nexora:menu-open', ['$event'])
  onCoordinatedMenuOpen(e: Event): void {
    const detail = (e as CustomEvent).detail;
    if (detail !== this.menuId && this.isOpen) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}
