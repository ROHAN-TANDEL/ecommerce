import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexoraAvatarComponent } from './avatar';

@Component({
  selector: 'nexora-user-identity',
  standalone: true,
  imports: [CommonModule, NexoraAvatarComponent],
  template: `
    <div class="inline-flex items-center gap-2.5">
      <nexora-avatar [src]="avatar" [name]="name" [size]="size" [status]="status"></nexora-avatar>
      <div class="flex flex-col truncate">
        <span class="text-xs font-semibold text-[#101828] leading-tight truncate">{{ name }}</span>
        <span *ngIf="subtitle || email" class="text-[10px] text-[#667085] leading-tight truncate mt-0.5">
          {{ subtitle || email }}
        </span>
      </div>
    </div>
  `
})
export class NexoraUserIdentityComponent {
  @Input() name = 'Sarah Jenkins';
  @Input() email = 'sarah@acme.io';
  @Input() subtitle = '';
  @Input() avatar = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() status?: 'online' | 'away' | 'busy' | 'offline';
}

@Component({
  selector: 'nexora-user-card',
  standalone: true,
  imports: [CommonModule, NexoraAvatarComponent],
  template: `
    <div class="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-xs flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <nexora-avatar [src]="avatar" [name]="name" size="lg" [status]="status"></nexora-avatar>
        <div class="truncate">
          <div class="flex items-center gap-2">
            <h5 class="text-xs font-bold text-[#101828] truncate">{{ name }}</h5>
            <span *ngIf="badge" class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#EFF4FF] text-[#436CF3]">{{ badge }}</span>
          </div>
          <p class="text-[11px] text-[#667085] truncate">{{ department || role }}</p>
          <p *ngIf="email" class="text-[10px] text-[#98A2B3] truncate">{{ email }}</p>
        </div>
      </div>

      <div class="text-right shrink-0">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          [class.bg-[#ECFDF3]]="active"
          [class.text-[#027A48]]="active"
          [class.bg-[#FEF3F2]]="!active"
          [class.text-[#B42318]]="!active"
        >
          <span class="w-1.5 h-1.5 rounded-full" [class.bg-[#12B76A]]="active" [class.bg-[#F04438]]="!active"></span>
          {{ active ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>
  `
})
export class NexoraUserCardComponent {
  @Input() name = 'Jo Doh';
  @Input() department = 'Finance';
  @Input() role = '';
  @Input() email = 'doh@example.com';
  @Input() avatar = '';
  @Input() badge = '';
  @Input() active = true;
  @Input() status?: 'online' | 'away' | 'busy' | 'offline' = 'online';
}
