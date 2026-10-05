import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserOption {
  id: string | number;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  online?: boolean;
}

@Component({
  selector: 'nexora-user-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block w-full">
      <!-- Selector Trigger Button: [ 🔵 John Smith ▼ ] -->
      <button
        type="button"
        [disabled]="disabled"
        (click)="toggleMenu($event)"
        class="h-9 w-full px-2.5 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] flex items-center justify-between gap-2 text-xs font-semibold text-[#1D2939] shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        [class.border-[#436CF3]]="isOpen"
        [class.ring-2]="isOpen"
        [class.ring-[#EFF4FF]]="isOpen"
      >
        <div class="flex items-center gap-2 truncate">
          <!-- Avatar with presence dot -->
          <div class="relative shrink-0">
            <img *ngIf="selectedUser?.avatar" [src]="selectedUser?.avatar" class="w-5 h-5 rounded-full object-cover" />
            <div *ngIf="!selectedUser?.avatar" class="w-5 h-5 rounded-full bg-[#EFF4FF] text-[#436CF3] font-bold text-[10px] flex items-center justify-center">
              {{ (selectedUser?.name || 'U').slice(0, 1) }}
            </div>
            <span
              *ngIf="selectedUser?.online !== undefined"
              class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white"
              [class.bg-[#12B76A]]="selectedUser?.online"
              [class.bg-[#98A2B3]]="!selectedUser?.online"
            ></span>
          </div>

          <span class="truncate">{{ selectedUser?.name || placeholder }}</span>
          <span *ngIf="selectedUser?.role" class="text-[10px] font-normal text-[#667085] truncate">({{ selectedUser?.role }})</span>
        </div>

        <svg class="w-3.5 h-3.5 text-[#667085] shrink-0 transition-transform duration-200" [class.rotate-180]="isOpen" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isOpen"
        class="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-[#EAECF0] bg-white py-1 shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
      >
        <button
          *ngFor="let u of users"
          type="button"
          (click)="selectUser(u)"
          class="w-full px-3 py-2 text-xs flex items-center justify-between text-left hover:bg-[#F8F9FC] transition-colors cursor-pointer"
          [class.bg-[#EFF4FF]]="u.id === selectedId"
        >
          <div class="flex items-center gap-2.5 truncate">
            <div class="relative shrink-0">
              <img *ngIf="u.avatar" [src]="u.avatar" class="w-6 h-6 rounded-full object-cover" />
              <div *ngIf="!u.avatar" class="w-6 h-6 rounded-full bg-[#EFF4FF] text-[#436CF3] font-bold text-xs flex items-center justify-center">
                {{ u.name.slice(0, 1) }}
              </div>
              <span
                *ngIf="u.online !== undefined"
                class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white"
                [class.bg-[#12B76A]]="u.online"
                [class.bg-[#98A2B3]]="!u.online"
              ></span>
            </div>

            <div class="truncate">
              <div class="font-semibold text-[#101828] truncate">{{ u.name }}</div>
              <div *ngIf="u.email || u.role" class="text-[10px] text-[#667085] truncate">
                {{ u.email || u.role }}
              </div>
            </div>
          </div>

          <svg *ngIf="u.id === selectedId" class="w-4 h-4 text-[#436CF3] shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class NexoraUserSelectorComponent {
  @Input() users: UserOption[] = [];
  @Input() selectedId: string | number | null = null;
  @Input() placeholder = 'Select user...';
  @Input() disabled = false;

  @Output() selectedIdChange = new EventEmitter<string | number>();
  @Output() userSelected = new EventEmitter<UserOption>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  get selectedUser(): UserOption | undefined {
    return this.users.find(u => u.id === this.selectedId);
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  selectUser(u: UserOption): void {
    this.selectedId = u.id;
    this.selectedIdChange.emit(this.selectedId);
    this.userSelected.emit(u);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
