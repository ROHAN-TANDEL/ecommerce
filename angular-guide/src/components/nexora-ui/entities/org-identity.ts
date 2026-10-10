import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-org-identity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2.5">
      <!-- Org Logo Box -->
      <div class="w-8 h-8 rounded-lg bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
        {{ logo || orgName.slice(0, 2).toUpperCase() }}
      </div>
      <div class="flex flex-col truncate">
        <div class="flex items-center gap-1.5 truncate">
          <span class="text-xs font-bold text-[#101828] truncate">{{ orgName }}</span>
          <span *ngIf="tier" class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#F2F4F7] text-[#475467]">{{ tier }}</span>
        </div>
        <span *ngIf="membersCount" class="text-[10px] text-[#667085] truncate">
          {{ membersCount }} active members
        </span>
      </div>
    </div>
  `
})
export class NexoraOrgIdentityComponent {
  @Input() orgName = 'Acme Global';
  @Input() logo = '';
  @Input() tier = 'Enterprise';
  @Input() membersCount = 142;
}

@Component({
  selector: 'nexora-entity-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3.5 rounded-xl border border-[#EAECF0] bg-white shadow-xs flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 truncate">
        <div class="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#436CF3] flex items-center justify-center text-sm font-bold shrink-0">
          {{ icon || '📦' }}
        </div>
        <div class="truncate">
          <h5 class="text-xs font-semibold text-[#101828] truncate">{{ title }}</h5>
          <span class="text-[10px] text-[#667085] truncate">{{ subtitle }}</span>
        </div>
      </div>

      <span *ngIf="badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F4F7] text-[#344054] shrink-0">
        {{ badge }}
      </span>
    </div>
  `
})
export class NexoraEntityCardComponent {
  @Input() title = 'Cluster Node 01';
  @Input() subtitle = 'us-east-1 &bull; 8vCPU 32GB';
  @Input() icon = '🖥';
  @Input() badge = 'Healthy';
}
