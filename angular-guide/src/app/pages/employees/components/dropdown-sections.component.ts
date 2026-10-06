import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionActionGroup, ActionItemConfig, ActionDropdownOption } from '../employees.types';

@Component({
  selector: 'dropdown-sections-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left" *ngIf="section && section.actions && section.actions.length > 0">
      <!-- Section Dropdown Trigger -->
      <button
        type="button"
        (click)="toggleMenu($event)"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
        [title]="section.name + ' Section'"
      >
        <span>{{ section.name }}</span>
        <svg
          class="w-3 h-3 text-slate-400 transition-transform"
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
        class="absolute right-0 top-full mt-1.5 z-[100] w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 whitespace-nowrap"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-100 mb-1">
          {{ section.name }} Menu
        </div>

        <div *ngFor="let action of section.actions" class="relative group">
          <button
            type="button"
            (click)="onActionItemClick(action, $event)"
            class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
            [title]="action.info_note || action.name"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ action.name }}</span>
            </div>

            <svg
              *ngIf="action.dropdown_options || action.dynamic_dropdown"
              class="w-3 h-3 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Submenu Flyout (for items like Export, Download, View, Density) -->
          <div
            *ngIf="activeSubmenuKey === action.key && action.dropdown_options"
            class="absolute right-full top-0 mr-1.5 z-[110] w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
          >
            <div class="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400 border-b border-slate-100 mb-1">
              {{ action.name }} Options
            </div>

            <button
              *ngFor="let optKey of action.dropdown_options | keyvalue"
              type="button"
              (click)="onSubOptionClick(action, optKey.key, optKey.value, $event)"
              class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <div>
                <div class="font-medium">{{ optKey.value.display_name }}</div>
                <div *ngIf="optKey.value.info_note" class="text-[10px] text-slate-400">
                  {{ optKey.value.info_note }}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DropdownSectionsComponent {
  @Input({ required: true }) section!: SectionActionGroup;
  @Output() actionSelect = new EventEmitter<{ actionKey: string; optionKey?: string }>();

  isOpen = false;
  activeSubmenuKey: string | null = null;

  constructor(private readonly elRef: ElementRef) {}

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.activeSubmenuKey = null;
    }
  }

  onActionItemClick(action: ActionItemConfig & { key: string }, e: MouseEvent): void {
    e.stopPropagation();
    if (action.dropdown_options || action.dynamic_dropdown) {
      this.activeSubmenuKey = this.activeSubmenuKey === action.key ? null : action.key;
      return;
    }
    this.isOpen = false;
    this.activeSubmenuKey = null;
    this.actionSelect.emit({ actionKey: action.key });
  }

  onSubOptionClick(
    action: ActionItemConfig & { key: string },
    optKey: string,
    opt: ActionDropdownOption,
    e: MouseEvent
  ): void {
    e.stopPropagation();
    this.isOpen = false;
    this.activeSubmenuKey = null;
    this.actionSelect.emit({ actionKey: action.key, optionKey: optKey });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
      this.activeSubmenuKey = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
    this.activeSubmenuKey = null;
  }
}
