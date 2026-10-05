import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors select-none"
      [class.bg-[#EFF4FF]]="color === 'blue'"
      [class.border-[#B2CCFF]]="color === 'blue'"
      [class.text-[#175CD3]]="color === 'blue'"
      [class.bg-[#ECFDF3]]="color === 'green'"
      [class.border-[#A6F4C5]]="color === 'green'"
      [class.text-[#027A48]]="color === 'green'"
      [class.bg-[#F2F4F7]]="color === 'gray'"
      [class.border-[#EAECF0]]="color === 'gray'"
      [class.text-[#344054]]="color === 'gray'"
    >
      <span *ngIf="icon">{{ icon }}</span>
      <span>{{ label }}</span>
      <button
        *ngIf="removable"
        type="button"
        (click)="removed.emit()"
        class="hover:opacity-75 focus:outline-none cursor-pointer text-[13px] font-bold leading-none"
      >
        &times;
      </button>
    </span>
  `
})
export class NexoraChipComponent {
  @Input() label = 'Finance';
  @Input() icon = '';
  @Input() color: 'blue' | 'green' | 'gray' = 'blue';
  @Input() removable = true;

  @Output() removed = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-presence-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 text-xs font-semibold select-none">
      <span class="w-2 h-2 rounded-full" [ngClass]="getDotClass()"></span>
      <span [ngClass]="getTextClass()">{{ getStatusLabel() }}</span>
    </span>
  `
})
export class NexoraPresenceIndicatorComponent {
  @Input() status: 'online' | 'away' | 'busy' | 'offline' = 'online';
  @Input() customLabel = '';

  getStatusLabel(): string {
    if (this.customLabel) return this.customLabel;
    switch (this.status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Do Not Disturb';
      case 'offline': return 'Offline';
    }
  }

  getDotClass(): string {
    switch (this.status) {
      case 'online': return 'bg-[#12B76A] ring-2 ring-[#ECFDF3]';
      case 'away': return 'bg-[#F79009] ring-2 ring-[#FEF0C7]';
      case 'busy': return 'bg-[#F04438] ring-2 ring-[#FEF3F2]';
      case 'offline': return 'bg-[#98A2B3] ring-2 ring-[#F2F4F7]';
    }
  }

  getTextClass(): string {
    switch (this.status) {
      case 'online': return 'text-[#027A48]';
      case 'away': return 'text-[#B54708]';
      case 'busy': return 'text-[#B42318]';
      case 'offline': return 'text-[#667085]';
    }
  }
}
