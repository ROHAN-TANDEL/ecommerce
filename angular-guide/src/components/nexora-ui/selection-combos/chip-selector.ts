import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChipItem {
  id: string | number;
  label: string;
  color?: string;
}

@Component({
  selector: 'nexora-chip-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[#D0D5DD] bg-white relative">
      <!-- Selected Chips: [ Finance × ] [ HR × ] -->
      <span
        *ngFor="let item of selected"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EFF4FF] text-[#436CF3] animate-in fade-in duration-100"
      >
        <span>{{ item.label }}</span>
        <button
          type="button"
          [disabled]="disabled"
          (click)="remove(item, $event)"
          class="text-[#436CF3] hover:text-[#B42318] focus:outline-none cursor-pointer"
        >
          &times;
        </button>
      </span>

      <!-- [ + Add ] Action Trigger -->
      <div class="relative">
        <button
          type="button"
          [disabled]="disabled || availableOptions.length === 0"
          (click)="toggleMenu($event)"
          class="h-6 px-2 rounded-md border border-dashed border-[#D0D5DD] hover:border-[#436CF3] hover:text-[#436CF3] text-[11px] font-medium text-[#667085] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
        >
          <span>+</span>
          <span>Add</span>
        </button>

        <!-- Dropdown of available chips to add -->
        <div
          *ngIf="isOpen && availableOptions.length > 0"
          class="absolute left-0 top-[calc(100%+4px)] z-50 w-44 rounded-xl border border-[#EAECF0] bg-white py-1 shadow-lg max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            *ngFor="let opt of availableOptions"
            type="button"
            (click)="add(opt)"
            class="w-full px-3 py-1.5 text-xs text-left text-[#344054] hover:bg-[#F8F9FC] hover:text-[#436CF3] transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>{{ opt.label }}</span>
            <span class="text-[10px] text-[#98A2B3]">+</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class NexoraChipSelectorComponent {
  @Input() allOptions: ChipItem[] = [];
  @Input() selected: ChipItem[] = [];
  @Input() disabled = false;

  @Output() selectedChange = new EventEmitter<ChipItem[]>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  get availableOptions(): ChipItem[] {
    const selectedIds = new Set(this.selected.map(s => s.id));
    return this.allOptions.filter(o => !selectedIds.has(o.id));
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  add(opt: ChipItem): void {
    this.selected = [...this.selected, opt];
    this.selectedChange.emit(this.selected);
    this.isOpen = false;
  }

  remove(opt: ChipItem, e: MouseEvent): void {
    e.stopPropagation();
    this.selected = this.selected.filter(s => s.id !== opt.id);
    this.selectedChange.emit(this.selected);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
