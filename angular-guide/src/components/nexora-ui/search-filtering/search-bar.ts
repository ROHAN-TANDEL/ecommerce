import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative flex items-center w-full">
      <!-- Search Icon -->
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
        </svg>
      </div>

      <input
        type="text"
        [(ngModel)]="query"
        (ngModelChange)="onQueryChange($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        class="w-full h-9 pl-9 pr-14 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF] transition-all disabled:bg-[#F8F9FC]"
      />

      <!-- Right shortcut pill / Clear button -->
      <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        <button
          *ngIf="query"
          type="button"
          (click)="clear()"
          class="text-[#98A2B3] hover:text-[#344054] focus:outline-none cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
          </svg>
        </button>

        <kbd *ngIf="!query && shortcut" class="px-1.5 py-0.5 text-[9px] font-mono text-[#98A2B3] bg-[#F2F4F7] rounded border border-[#EAECF0]">
          {{ shortcut }}
        </kbd>
      </div>
    </div>
  `
})
export class NexoraSearchBarComponent {
  @Input() query = '';
  @Input() placeholder = 'Search users, entities, orders...';
  @Input() shortcut = '⌘K';
  @Input() disabled = false;

  @Output() queryChange = new EventEmitter<string>();

  onQueryChange(val: string): void {
    this.query = val;
    this.queryChange.emit(this.query);
  }

  clear(): void {
    this.query = '';
    this.queryChange.emit('');
  }
}
