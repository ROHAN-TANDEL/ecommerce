import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionActionGroup, ActionItemConfig, ActionDropdownOption } from '../employees.types';

@Component({
  selector: 'action-panel-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">

      <!-- Left: Pinned Toolbar Actions Slot -->
      <div class="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <ng-content select="[pinned], refresh-component, save-component, edit-component, lock-component, density-component, button-component"></ng-content>
      </div>

      <!-- Right: Main ⚙ Actions Menu -->
      <div *ngIf="showMenu && sectionGroups && sectionGroups.length > 0" class="relative" (click)="$event.stopPropagation()">
        <button
          type="button"
          (click)="actionsMenuOpen = !actionsMenuOpen"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Actions</span>
          <svg class="w-3 h-3 text-slate-400 transition-transform" [class.rotate-180]="actionsMenuOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown Popover: Grouped by Sections -->
        <div
          *ngIf="actionsMenuOpen"
          class="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl divide-y divide-slate-100"
        >
          <div *ngFor="let section of sectionGroups" class="py-1 first:pt-0 last:pb-0">
            <div class="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
              {{ section.name }}
            </div>

            <div class="space-y-0.5">
              <div *ngFor="let action of section.actions" class="relative group">
                <button
                  type="button"
                  (click)="onActionItemClick(action)"
                  class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  <span class="font-medium">{{ action.name }}</span>
                  <svg *ngIf="action.dropdown_options || action.dynamic_dropdown" class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <!-- Submenu Popover -->
                <div
                  *ngIf="activeSubmenuKey === action.key && action.dropdown_options"
                  class="absolute right-full top-0 mr-1.5 z-60 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
                >
                  <div class="px-2 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400">
                    {{ action.name }} Options
                  </div>
                  <button
                    *ngFor="let optKey of action.dropdown_options | keyvalue"
                    type="button"
                    (click)="onSubOptionClick(action, optKey.key, optKey.value)"
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
        </div>
      </div>

    </div>
  `,
})
export class ActionPanelComponent {
  @Input() sectionGroups: SectionActionGroup[] = [];
  @Input() showMenu = true;
  @Output() actionSelect = new EventEmitter<{ actionKey: string; optionKey?: string }>();

  actionsMenuOpen = false;
  activeSubmenuKey: string | null = null;

  constructor(private readonly elRef: ElementRef) {}

  onActionItemClick(action: ActionItemConfig & { key: string }): void {
    if (action.dropdown_options || action.dynamic_dropdown) {
      this.activeSubmenuKey = this.activeSubmenuKey === action.key ? null : action.key;
      return;
    }
    this.actionsMenuOpen = false;
    this.activeSubmenuKey = null;
    this.actionSelect.emit({ actionKey: action.key });
  }

  onSubOptionClick(action: ActionItemConfig & { key: string }, optKey: string, opt: ActionDropdownOption): void {
    this.actionsMenuOpen = false;
    this.activeSubmenuKey = null;
    this.actionSelect.emit({ actionKey: action.key, optionKey: optKey });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.actionsMenuOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.actionsMenuOpen = false;
      this.activeSubmenuKey = null;
    }
  }
}
