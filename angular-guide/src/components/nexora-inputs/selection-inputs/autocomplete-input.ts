import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AutocompleteItem {
  id: any;
  label: string;
  sublabel?: string;
  avatar?: string;
  icon?: string;
}

@Component({
  selector: 'nexora-autocomplete-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1 w-full relative">
      <div class="flex items-center justify-between">
        <label *ngIf="label" class="text-xs font-semibold text-[#344054]">
          {{ label }}
          <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
        </label>
        <span *ngIf="badge" class="text-[10px] font-medium text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">
          {{ badge }}
        </span>
      </div>

      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (focus)="isOpen = true"
          (input)="onInputChange()"
          [disabled]="disabled"
          [placeholder]="placeholder"
          class="w-full h-9 pl-9 pr-8 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939]
                 placeholder:text-[#98A2B3] focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                 disabled:bg-[#F8F9FC] disabled:cursor-not-allowed transition-all"
        />

        <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none">
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
          </svg>
        </div>

        <button
          *ngIf="searchQuery"
          type="button"
          (click)="clear()"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085]"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Dropdown Results -->
      <div
        *ngIf="isOpen && filteredItems.length > 0"
        class="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white rounded-lg border border-[#EAECF0] shadow-lg py-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
      >
        <button
          *ngFor="let item of filteredItems"
          type="button"
          (click)="selectItem(item)"
          class="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-left hover:bg-[#F8F9FC] transition-colors cursor-pointer"
        >
          <!-- Avatar or Icon -->
          <img *ngIf="item.avatar" [src]="item.avatar" class="w-6 h-6 rounded-full object-cover shrink-0" />
          <div *ngIf="!item.avatar && item.icon" class="w-6 h-6 rounded-full bg-[#EFF4FF] text-[#436CF3] flex items-center justify-center shrink-0">
            <i [class]="item.icon + ' text-[10px]'"></i>
          </div>
          <div *ngIf="!item.avatar && !item.icon" class="w-6 h-6 rounded-full bg-[#F2F4F7] text-[#667085] flex items-center justify-center text-[10px] font-bold shrink-0">
            {{ item.label.slice(0, 1) }}
          </div>

          <div class="truncate">
            <div class="font-medium text-[#1D2939] truncate">{{ item.label }}</div>
            <div *ngIf="item.sublabel" class="text-[10px] text-[#667085] truncate">{{ item.sublabel }}</div>
          </div>
        </button>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraAutocompleteInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() placeholder = 'Type to search...';
  @Input() required = false;
  @Input() disabled = false;
  @Input() items: AutocompleteItem[] = [];

  @Input() searchQuery = '';
  @Output() selected = new EventEmitter<AutocompleteItem>();
  @Output() searchQueryChange = new EventEmitter<string>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  get filteredItems(): AutocompleteItem[] {
    if (!this.searchQuery) return this.items;
    const q = this.searchQuery.toLowerCase();
    return this.items.filter(i =>
      i.label.toLowerCase().includes(q) || (i.sublabel && i.sublabel.toLowerCase().includes(q))
    );
  }

  onInputChange() {
    this.isOpen = true;
    this.searchQueryChange.emit(this.searchQuery);
  }

  selectItem(item: AutocompleteItem) {
    this.searchQuery = item.label;
    this.searchQueryChange.emit(this.searchQuery);
    this.selected.emit(item);
    this.isOpen = false;
  }

  clear() {
    this.searchQuery = '';
    this.searchQueryChange.emit(this.searchQuery);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
