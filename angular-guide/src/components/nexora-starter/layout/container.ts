import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="mx-auto w-full transition-all"
      [class.max-w-7xl]="maxWidth === '7xl'"
      [class.max-w-5xl]="maxWidth === '5xl'"
      [class.max-w-3xl]="maxWidth === '3xl'"
      [class.max-w-full]="maxWidth === 'full'"
      [class.px-4]="padding"
      [class.sm:px-6]="padding"
      [class.lg:px-8]="padding"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class NexoraContainerComponent {
  @Input() maxWidth: '3xl' | '5xl' | '7xl' | 'full' = '7xl';
  @Input() padding = true;
}

@Component({
  selector: 'nexora-section-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-2xl border border-[#EAECF0] bg-white shadow-xs overflow-hidden">
      <!-- Section Header -->
      <div *ngIf="title" class="px-5 py-3.5 bg-[#F9FAFB] border-b border-[#EAECF0] flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-[#101828]">{{ title }}</h3>
          <p *ngIf="description" class="text-xs text-[#667085] mt-0.5">{{ description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <!-- Section Body -->
      <div class="p-5">
        <ng-content></ng-content>
      </div>
    </section>
  `
})
export class NexoraSectionLayoutComponent {
  @Input() title = '';
  @Input() description = '';
}

@Component({
  selector: 'nexora-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 rounded-xl border border-[#EAECF0] bg-[#FAFAFA] flex flex-col gap-2">
      <div *ngIf="title" class="flex items-center justify-between pb-2 border-b border-[#EAECF0]">
        <h5 class="text-xs font-bold text-[#101828]">{{ title }}</h5>
        <span *ngIf="badge" class="text-[10px] font-semibold text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">{{ badge }}</span>
      </div>
      <div class="text-xs text-[#344054]">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class NexoraPanelComponent {
  @Input() title = '';
  @Input() badge = '';
}

@Component({
  selector: 'nexora-stack',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex"
      [class.flex-col]="direction === 'col'"
      [class.flex-row]="direction === 'row'"
      [class.items-center]="align === 'center'"
      [class.items-start]="align === 'start'"
      [class.items-end]="align === 'end'"
      [class.justify-between]="justify === 'between'"
      [class.justify-start]="justify === 'start'"
      [class.justify-end]="justify === 'end'"
      [class.gap-2]="gap === 'sm'"
      [class.gap-4]="gap === 'md'"
      [class.gap-6]="gap === 'lg'"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class NexoraStackComponent {
  @Input() direction: 'row' | 'col' = 'row';
  @Input() align: 'start' | 'center' | 'end' = 'center';
  @Input() justify: 'start' | 'between' | 'end' = 'start';
  @Input() gap: 'sm' | 'md' | 'lg' = 'md';
}
