import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SectionActionGroup, ActionItemConfig, ActionDropdownOption, EnrichedColumn } from '../employees.types';
import { ScrollerComponent } from './scroller.component';

@Component({
  selector: 'dropdown-sections-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollerComponent],
  template: `
    <div class="relative inline-block text-left" *ngIf="section && section.actions && section.actions.length > 0">
      <!-- Section Dropdown Trigger -->
      <button
        type="button"
        (click)="toggleMenu($event)"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
        [title]="section.name + ' Section'"
      >
        <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
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
        class="absolute right-0 top-full mt-1.5 z-[100] w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 whitespace-nowrap"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-100 mb-1">
          {{ section.name }} Menu
        </div>

        <div *ngFor="let action of section.actions" class="relative group">
          <!-- Special Case: Scroller action item replaced with interactive scroller control -->
          <div
            *ngIf="action.key === 'scroller' || action.component === 'scroller_component'; else defaultActionBtn"
            class="flex items-center justify-center rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors select-none"
            (click)="$event.stopPropagation()"
          >
            <scroller-component
              [percentage]="scrollPercentage"
              [totalColumns]="getVisibleColumnCount()"
              [isScrollable]="isScrollable"
              (scroll)="scrollTable.emit($event)"
            ></scroller-component>
          </div>

          <ng-template #defaultActionBtn>
            <button
              type="button"
              [disabled]="isActionDisabled(action.key)"
              (click)="onActionItemClick(action, $event)"
              [ngClass]="{
                'opacity-40 cursor-not-allowed bg-slate-50/60 text-slate-400': isActionDisabled(action.key),
                'text-slate-700 hover:bg-slate-100 cursor-pointer': !isActionDisabled(action.key)
              }"
              class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors text-left"
              [title]="getActionTooltip(action)"
            >
              <div class="flex items-center gap-2">
                <ng-container [ngSwitch]="action.key">
                  <svg *ngSwitchCase="'refresh'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <svg *ngSwitchCase="'lock'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2" stroke-linecap="round" stroke-linejoin="round" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0v4" /></svg>
                  <svg *ngSwitchCase="'edit'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  <svg *ngSwitchCase="'save'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  <svg *ngSwitchCase="'delete'" class="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <svg *ngSwitchCase="'enable'" class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <svg *ngSwitchCase="'disable'" class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  <svg *ngSwitchCase="'revert'" class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4" /></svg>
                  <svg *ngSwitchCase="'expand'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  <svg *ngSwitchCase="'copy'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <svg *ngSwitchCase="'reset'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <svg *ngSwitchCase="'export'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <svg *ngSwitchCase="'download'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <svg *ngSwitchCase="'fullscreen'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
                  <svg *ngSwitchCase="'collapse'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  <svg *ngSwitchCase="'view'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg *ngSwitchCase="'density'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  <svg *ngSwitchCase="'columns'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                  <svg *ngSwitchCase="'scroller'" class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                  <svg *ngSwitchCase="'live'" class="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.072m7.072 0a5 5 0 010 7.072M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                  <svg *ngSwitchDefault class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /></svg>
                </ng-container>
                <span class="font-medium">{{ action.name || (action.key | titlecase) }}</span>
              </div>

              <!-- Submenu indicator or accessory (Image 3) -->
              <div class="flex items-center gap-1.5 shrink-0">
                <span *ngIf="action.key === 'refresh'" class="text-[10px] text-slate-400 font-mono">5s</span>
                <svg
                  *ngIf="action.dropdown_options || action.dynamic_dropdown || action.key === 'columns' || action.key === 'view' || action.key === 'refresh'"
                  class="w-3 h-3 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </button>
          </ng-template>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- SUBMENU 1: DYNAMIC COLUMNS (Search, Toggle, Reorder)        -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            *ngIf="activeSubmenuKey === action.key && (action.key === 'columns' || action.dynamic_dropdown)"
            class="absolute right-full top-0 mr-1.5 z-[110] w-64 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xl space-y-2"
          >
            <div class="flex items-center justify-between pb-1 border-b border-slate-100">
              <span class="text-xs font-semibold text-slate-800">
                Columns ({{ getVisibleColumnCount() }}/{{ columns.length }})
              </span>
              <button
                type="button"
                (click)="onResetColumnsClick($event)"
                class="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Reset
              </button>
            </div>

            <!-- Search Columns Input -->
            <div class="relative">
              <input
                type="text"
                placeholder="Search columns..."
                [(ngModel)]="columnSearchQuery"
                (click)="$event.stopPropagation()"
                class="w-full h-6 rounded border border-slate-200 bg-slate-50 px-2 text-[11px] placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <!-- Column Checkbox List with Up/Down Reordering -->
            <div class="max-h-52 overflow-y-auto space-y-1 py-1">
              <div
                *ngFor="let col of getFilteredColumns(); let i = index; let first = first; let last = last"
                class="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-50 text-xs transition-colors group/item"
                (click)="$event.stopPropagation()"
              >
                <label class="flex items-center gap-2 cursor-pointer flex-1 truncate select-none">
                  <input
                    type="checkbox"
                    [checked]="col.active !== false"
                    (change)="onToggleColumnClick(col.key, $event)"
                    class="rounded border-slate-300 accent-slate-900 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span class="truncate text-slate-700" [class.font-semibold]="col.active !== false">
                    {{ col.header_name }}
                  </span>
                </label>

                <!-- Reorder arrows -->
                <div class="flex items-center gap-0.5 opacity-60 group-hover/item:opacity-100">
                  <button
                    type="button"
                    [disabled]="first"
                    (click)="onReorderClick(col.key, 'up', $event)"
                    class="w-4 h-4 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer text-[10px]"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    [disabled]="last"
                    (click)="onReorderClick(col.key, 'down', $event)"
                    class="w-4 h-4 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer text-[10px]"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>


          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- SUBMENU 3: SAVED VIEWS                                      -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- SUBMENU 3: SAVED VIEWS (Exact match to Image 3)            -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            *ngIf="activeSubmenuKey === action.key && action.key === 'view'"
            class="absolute right-full top-0 mr-1.5 z-[110] w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl space-y-0.5"
          >
            <div class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              SAVED VIEWS
            </div>

            <button
              type="button"
              (click)="onViewSelect('default_view', $event)"
              class="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <span class="text-blue-600 font-bold text-xs leading-none">✓</span>
              <span class="font-medium">Default</span>
            </button>

            <button
              type="button"
              (click)="onViewSelect('current_view', $event)"
              class="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <span class="text-slate-400 text-sm leading-none font-medium">+</span>
              <span class="font-medium">Save current view</span>
            </button>

            <button
              type="button"
              (click)="onViewSelect('reset_view', $event)"
              class="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4" />
              </svg>
              <span class="font-medium">Reset view</span>
            </button>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- SUBMENU 4: GENERIC OPTIONS (Density, Export, Download, etc) -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            *ngIf="activeSubmenuKey === action.key && action.dropdown_options && action.key !== 'columns' && action.key !== 'scroller' && action.key !== 'view'"
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
  @Input() isIndividualSelected = false;
  @Input() isMasterChecked = false;
  @Input() hasDirtyRows = false;
  @Input() columns: EnrichedColumn[] = [];
  @Input() scrollPercentage = 0;
  @Input() isScrollable = false;

  @Output() actionSelect = new EventEmitter<{ actionKey: string; optionKey?: string }>();
  @Output() toggleColumn = new EventEmitter<string>();
  @Output() reorderColumn = new EventEmitter<{ colKey: string; direction: 'up' | 'down' }>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() scrollTable = new EventEmitter<'left' | 'right' | 'start' | 'end'>();

  isOpen = false;
  activeSubmenuKey: string | null = null;
  columnSearchQuery = '';

  constructor(private readonly elRef: ElementRef) {}

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.activeSubmenuKey = null;
    }
  }

  isActionDisabled(actionKey: string): boolean {
    if (actionKey === 'copy' || actionKey === 'enable' || actionKey === 'disable' || actionKey === 'delete') {
      // Disabled on master level or when 0 rows are selected
      return !this.isIndividualSelected;
    }
    if (actionKey === 'revert') {
      return !this.hasDirtyRows;
    }
    return false;
  }

  getActionTooltip(action: ActionItemConfig & { key: string }): string {
    if (action.key === 'copy' || action.key === 'enable' || action.key === 'disable' || action.key === 'delete') {
      if (this.isMasterChecked) {
        return `${action.name} is disabled when master checkbox is selected`;
      }
      if (!this.isIndividualSelected) {
        return `Select 1 or more individual rows to ${action.name.toLowerCase()}`;
      }
    }
    if (action.key === 'revert' && !this.hasDirtyRows) {
      return 'No unsaved changes to revert';
    }
    return action.info_note || action.name;
  }

  onActionItemClick(action: ActionItemConfig & { key: string }, e: MouseEvent): void {
    e.stopPropagation();
    if (isSubmenuAction(action)) {
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

  // Column helpers
  getVisibleColumnCount(): number {
    return this.columns.filter(c => c.active !== false).length;
  }

  getFilteredColumns(): EnrichedColumn[] {
    const q = this.columnSearchQuery.trim().toLowerCase();
    if (!q) return this.columns;
    return this.columns.filter(c => c.header_name.toLowerCase().includes(q));
  }

  onToggleColumnClick(colKey: string, e: Event): void {
    e.stopPropagation();
    this.toggleColumn.emit(colKey);
  }

  onReorderClick(colKey: string, direction: 'up' | 'down', e: MouseEvent): void {
    e.stopPropagation();
    this.reorderColumn.emit({ colKey, direction });
  }

  onResetColumnsClick(e: MouseEvent): void {
    e.stopPropagation();
    this.resetColumns.emit();
  }

  onScrollTableClick(direction: 'left' | 'right' | 'start' | 'end', e: MouseEvent): void {
    e.stopPropagation();
    this.isOpen = false;
    this.activeSubmenuKey = null;
    this.scrollTable.emit(direction);
  }

  onViewSelect(viewKey: string, e: MouseEvent): void {
    e.stopPropagation();
    this.isOpen = false;
    this.activeSubmenuKey = null;
    this.actionSelect.emit({ actionKey: 'view', optionKey: viewKey });
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

function isSubmenuAction(action: ActionItemConfig & { key: string }): boolean {
  return !!(
    action.dropdown_options ||
    action.dynamic_dropdown ||
    action.key === 'columns' ||
    action.key === 'view'
  );
}
