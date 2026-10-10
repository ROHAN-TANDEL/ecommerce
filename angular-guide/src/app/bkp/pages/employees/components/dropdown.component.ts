import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  key: string;
  label: string;
  info?: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'dropdown-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Trigger Button -->
      <button
        type="button"
        [disabled]="disabled"
        (click)="toggleOpen()"
        [ngClass]="{
          'bg-slate-100 border-slate-300 text-slate-900': isOpen,
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': !isOpen && !disabled,
          'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400': disabled
        }"
        class="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        [title]="label"
      >
        <!-- Optional Prefix Icon Slot -->
        <ng-content select="[icon]"></ng-content>

        <span class="font-medium">{{ label }}</span>

        <span *ngIf="selectedLabel" class="text-[10px] text-slate-400 capitalize">
          ({{ selectedLabel }})
        </span>

        <!-- Dropdown Chevron SVG -->
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

      <!-- Dropdown Popover Menu -->
      <div
        *ngIf="isOpen"
        [ngClass]="placement === 'right' ? 'right-0' : 'left-0'"
        class="absolute top-full mt-1.5 z-[100] min-w-[180px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5 whitespace-nowrap"
      >
        <div *ngIf="menuTitle" class="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400">
          {{ menuTitle }}
        </div>

        <button
          *ngFor="let opt of options"
          type="button"
          [disabled]="opt.disabled"
          (click)="onSelectOption(opt)"
          [ngClass]="{
            'bg-slate-100 font-semibold text-slate-900': opt.key === selectedKey,
            'text-slate-700 hover:bg-slate-50': opt.key !== selectedKey && !opt.disabled,
            'opacity-40 cursor-not-allowed': opt.disabled
          }"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-left"
        >
          <div>
            <div class="font-medium">{{ opt.label }}</div>
            <div *ngIf="opt.info" class="text-[10px] text-slate-400 font-normal">
              {{ opt.info }}
            </div>
          </div>

          <span *ngIf="opt.key === selectedKey" class="text-xs font-bold text-slate-900 ml-2">✓</span>
        </button>

        <!-- Project Custom Menu Items if any -->
        <ng-content select="[menu-item]"></ng-content>
      </div>
    </div>
  `,
})
export class DropdownComponent {
  @Input({ required: true }) label = '';
  @Input() selectedLabel?: string;
  @Input() selectedKey?: string;
  @Input() menuTitle?: string;
  @Input() options: DropdownOption[] = [];
  @Input() disabled = false;
  @Input() placement: 'left' | 'right' = 'left';

  @Output() optionSelect = new EventEmitter<DropdownOption>();
  @Output() openedChange = new EventEmitter<boolean>();

  isOpen = false;

  constructor(private readonly elRef: ElementRef) {}

  toggleOpen(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.openedChange.emit(this.isOpen);
  }

  onSelectOption(opt: DropdownOption): void {
    if (opt.disabled) return;
    this.isOpen = false;
    this.openedChange.emit(false);
    this.optionSelect.emit(opt);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
      this.openedChange.emit(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.openedChange.emit(false);
    }
  }
}
