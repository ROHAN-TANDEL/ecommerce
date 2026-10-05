import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-toolbar-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-2.5 rounded-xl border border-[#EAECF0] bg-white shadow-xs flex flex-wrap items-center justify-between gap-3">
      <!-- Left controls slot -->
      <div class="flex items-center gap-2 flex-wrap">
        <ng-content select="[left]"></ng-content>
      </div>

      <!-- Right controls slot -->
      <div class="flex items-center gap-2 flex-wrap ml-auto">
        <ng-content select="[right]"></ng-content>
      </div>
    </div>
  `
})
export class NexoraToolbarLayoutComponent {}

@Component({
  selector: 'nexora-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-4 py-2.5 rounded-xl border border-[#B2CCFF] bg-[#EFF4FF] flex items-center justify-between gap-3 text-xs shadow-xs">
      <div class="flex items-center gap-2 font-semibold text-[#175CD3]">
        <span class="w-2 h-2 rounded-full bg-[#2E90FA] animate-ping"></span>
        <span>{{ selectedCount }} items selected</span>
      </div>

      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class NexoraActionBarComponent {
  @Input() selectedCount = 0;
}

@Component({
  selector: 'nexora-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="orientation === 'horizontal'"
      class="w-full h-px bg-[#EAECF0] my-2"
    ></div>
    <div
      *ngIf="orientation === 'vertical'"
      class="h-5 w-px bg-[#D0D5DD] mx-1 inline-block shrink-0 align-middle"
    ></div>
  `
})
export class NexoraDividerComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
}

@Component({
  selector: 'nexora-spacer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1"></div>
  `
})
export class NexoraSpacerComponent {}
