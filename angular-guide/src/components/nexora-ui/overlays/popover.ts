import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-popover',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <!-- Trigger -->
      <div (click)="toggle($event)" class="cursor-pointer inline-block">
        <ng-content select="[trigger]"></ng-content>
      </div>

      <!-- Popover Card -->
      <div
        *ngIf="isOpen"
        class="absolute z-50 left-0 top-[calc(100%+8px)] w-64 rounded-xl border border-[#EAECF0] bg-white p-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div *ngIf="title" class="text-xs font-bold text-[#101828] mb-1">{{ title }}</div>
        <div class="text-xs text-[#475467] leading-relaxed">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class NexoraPopoverComponent {
  @Input() title = '';
  isOpen = false;

  constructor(private el: ElementRef) {}

  toggle(e: MouseEvent): void {
    e.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}

@Component({
  selector: 'nexora-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block group" (mouseenter)="show = true" (mouseleave)="show = false">
      <ng-content></ng-content>

      <div
        *ngIf="show && text"
        class="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50 px-2 py-1 rounded bg-[#0F172A] text-white text-[10px] font-medium whitespace-nowrap shadow-md pointer-events-none animate-in fade-in duration-100"
      >
        {{ text }}
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F172A] rotate-45"></div>
      </div>
    </div>
  `
})
export class NexoraTooltipComponent {
  @Input() text = '';
  show = false;
}
