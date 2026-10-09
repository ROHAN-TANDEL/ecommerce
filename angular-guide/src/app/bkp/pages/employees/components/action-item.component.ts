import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionItemConfig, ActionDropdownOption } from '../employees.types';

@Component({
  selector: 'action-item-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Case 1: Dropdown Action Item (Has dropdown_options or dynamic_dropdown) -->
    <div
      *ngIf="action.dropdown_options || action.dynamic_dropdown; else buttonTpl"
      class="relative inline-block text-left"
    >
      <button
        type="button"
        [disabled]="!action.active"
        (click)="isDropdownOpen = !isDropdownOpen"
        [ngClass]="{
          'bg-slate-100 border-slate-300 text-slate-900': isDropdownOpen,
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': !isDropdownOpen && action.active,
          'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400': !action.active
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        [title]="action.info_note || action.name"
      >
        <span>{{ action.name }}</span>
        <svg
          class="w-3 h-3 text-slate-400 transition-transform shrink-0"
          [class.rotate-180]="isDropdownOpen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Popover -->
      <div
        *ngIf="isDropdownOpen && action.dropdown_options"
        class="absolute left-0 top-full mt-1.5 z-[100] min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5 whitespace-nowrap"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400">
          {{ action.name }} Options
        </div>

        <button
          *ngFor="let opt of action.dropdown_options | keyvalue"
          type="button"
          (click)="onSubOptionSelect(opt.key, opt.value)"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <div>
            <div class="font-medium">{{ opt.value.display_name }}</div>
            <div *ngIf="opt.value.info_note" class="text-[10px] text-slate-400 font-normal">
              {{ opt.value.info_note }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Case 2: Regular Click Action Button -->
    <ng-template #buttonTpl>
      <button
        type="button"
        [disabled]="!action.active"
        (click)="actionClick.emit({ actionKey: action.key })"
        [ngClass]="{
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': action.active,
          'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400': !action.active
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        [title]="action.info_note || action.name"
      >
        <span>{{ action.name }}</span>
      </button>
    </ng-template>
  `,
})
export class ActionItemComponent {
  @Input({ required: true }) action!: ActionItemConfig & { key: string };
  @Output() actionClick = new EventEmitter<{ actionKey: string; optionKey?: string }>();

  isDropdownOpen = false;

  constructor(private readonly elRef: ElementRef) {}

  onSubOptionSelect(optionKey: string, opt: ActionDropdownOption): void {
    this.isDropdownOpen = false;
    this.actionClick.emit({ actionKey: this.action.key, optionKey });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isDropdownOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isDropdownOpen = false;
  }
}
