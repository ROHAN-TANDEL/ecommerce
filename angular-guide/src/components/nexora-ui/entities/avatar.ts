import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'nexora-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block shrink-0">
      <img
        *ngIf="src"
        [src]="src"
        [alt]="name || 'Avatar'"
        class="rounded-full object-cover ring-2 ring-white"
        [ngClass]="getSizeClass()"
      />

      <div
        *ngIf="!src"
        class="rounded-full bg-[#EFF4FF] text-[#436CF3] font-bold flex items-center justify-center ring-2 ring-white uppercase select-none"
        [ngClass]="[getSizeClass(), getTextSizeClass()]"
      >
        {{ getInitials() }}
      </div>

      <!-- Online / Status Dot -->
      <span
        *ngIf="status"
        class="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white"
        [ngClass]="[getDotSizeClass(), getStatusClass()]"
      ></span>
    </div>
  `
})
export class NexoraAvatarComponent {
  @Input() src = '';
  @Input() name = '';
  @Input() size: AvatarSize = 'md';
  @Input() status?: 'online' | 'busy' | 'away' | 'offline';

  getInitials(): string {
    if (!this.name) return 'U';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name.slice(0, 2).toUpperCase();
  }

  getSizeClass(): string {
    switch (this.size) {
      case 'xs': return 'w-5 h-5';
      case 'sm': return 'w-7 h-7';
      case 'lg': return 'w-11 h-11';
      case 'xl': return 'w-14 h-14';
      case 'md':
      default:
        return 'w-9 h-9';
    }
  }

  getTextSizeClass(): string {
    switch (this.size) {
      case 'xs': return 'text-[9px]';
      case 'sm': return 'text-[11px]';
      case 'lg': return 'text-sm';
      case 'xl': return 'text-base';
      case 'md':
      default:
        return 'text-xs';
    }
  }

  getDotSizeClass(): string {
    switch (this.size) {
      case 'xs':
      case 'sm': return 'w-2 h-2';
      case 'lg':
      case 'xl': return 'w-3 h-3';
      case 'md':
      default:
        return 'w-2.5 h-2.5';
    }
  }

  getStatusClass(): string {
    switch (this.status) {
      case 'online': return 'bg-[#12B76A]';
      case 'away': return 'bg-[#F79009]';
      case 'busy': return 'bg-[#F04438]';
      case 'offline':
      default:
        return 'bg-[#98A2B3]';
    }
  }
}

@Component({
  selector: 'nexora-avatar-group',
  standalone: true,
  imports: [CommonModule, NexoraAvatarComponent],
  template: `
    <div class="inline-flex items-center -space-x-2">
      <div *ngFor="let av of visibleAvatars" class="relative hover:z-10 transition-transform hover:scale-105">
        <nexora-avatar
          [src]="av.src || ''"
          [name]="av.name || ''"
          [size]="size"
          [status]="av.status"
        ></nexora-avatar>
      </div>

      <!-- Count Badge +N -->
      <div
        *ngIf="extraCount > 0"
        class="rounded-full bg-[#F2F4F7] text-[#475467] font-bold flex items-center justify-center ring-2 ring-white select-none text-[10px]"
        [class.w-7]="size === 'sm'"
        [class.h-7]="size === 'sm'"
        [class.w-9]="size === 'md'"
        [class.h-9]="size === 'md'"
      >
        +{{ extraCount }}
      </div>
    </div>
  `
})
export class NexoraAvatarGroupComponent {
  @Input() avatars: { src?: string; name: string; status?: any }[] = [];
  @Input() max = 3;
  @Input() size: AvatarSize = 'sm';

  get visibleAvatars(): any[] {
    return this.avatars.slice(0, this.max);
  }

  get extraCount(): number {
    return Math.max(0, this.avatars.length - this.max);
  }
}
