import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'nexora-split-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex rounded-lg shadow-xs">
      <!-- Main Action -->
      <button
        type="button"
        [disabled]="disabled"
        (click)="onPrimaryClick()"
        class="h-9 px-3.5 bg-[#436CF3] hover:bg-[#3459D9] active:bg-[#2B49B8] text-white text-xs font-semibold rounded-l-lg border-r border-[#3459D9] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span *ngIf="icon">{{ icon }}</span>
        <span>{{ label }}</span>
      </button>

      <!-- Dropdown Trigger -->
      <button
        type="button"
        [disabled]="disabled"
        (click)="toggleMenu($event)"
        class="h-9 px-2 bg-[#436CF3] hover:bg-[#3459D9] active:bg-[#2B49B8] text-white text-xs rounded-r-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-3.5 h-3.5 transition-transform duration-200" [class.rotate-180]="isOpen" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Anchored Menu -->
      <div
        *ngIf="isOpen"
        class="absolute right-0 top-[calc(100%+4px)] z-50 w-44 rounded-lg border border-[#EAECF0] bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
      >
        <button
          *ngFor="let item of items"
          type="button"
          [disabled]="item.disabled"
          (click)="selectItem(item)"
          class="w-full px-3 py-2 text-xs flex items-center gap-2 text-left hover:bg-[#F8F9FC] transition-colors cursor-pointer disabled:opacity-40"
          [class.text-[#F04438]]="item.danger"
          [class.text-[#344054]]="!item.danger"
        >
          <span *ngIf="item.icon" class="text-xs">{{ item.icon }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </button>
      </div>
    </div>
  `
})
export class NexoraSplitButtonComponent {
  @Input() label = 'Save Changes';
  @Input() icon = '';
  @Input() disabled = false;
  @Input() items: DropdownMenuItem[] = [];

  @Output() action = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<DropdownMenuItem>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  onPrimaryClick(): void {
    if (!this.disabled) this.action.emit();
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  selectItem(item: DropdownMenuItem): void {
    if (item.disabled) return;
    this.itemSelected.emit(item);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}

@Component({
  selector: 'nexora-dropdown-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <button
        type="button"
        [disabled]="disabled"
        (click)="toggleMenu($event)"
        class="h-9 px-3.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#344054] inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
      >
        <span *ngIf="icon">{{ icon }}</span>
        <span>{{ label }}</span>
        <svg class="w-3.5 h-3.5 text-[#667085] transition-transform duration-200" [class.rotate-180]="isOpen" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </button>

      <div
        *ngIf="isOpen"
        class="absolute left-0 top-[calc(100%+4px)] z-50 w-44 rounded-lg border border-[#EAECF0] bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
      >
        <button
          *ngFor="let item of items"
          type="button"
          [disabled]="item.disabled"
          (click)="selectItem(item)"
          class="w-full px-3 py-2 text-xs flex items-center gap-2 text-left hover:bg-[#F8F9FC] transition-colors cursor-pointer disabled:opacity-40"
          [class.text-[#F04438]]="item.danger"
          [class.text-[#344054]]="!item.danger"
        >
          <span *ngIf="item.icon" class="text-xs">{{ item.icon }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </button>
      </div>
    </div>
  `
})
export class NexoraDropdownButtonComponent {
  @Input() label = 'Actions';
  @Input() icon = '';
  @Input() disabled = false;
  @Input() items: DropdownMenuItem[] = [];

  @Output() itemSelected = new EventEmitter<DropdownMenuItem>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  selectItem(item: DropdownMenuItem): void {
    if (item.disabled) return;
    this.itemSelected.emit(item);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
