import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AccordionSection {
  id: string;
  title: string;
  content: string;
  open?: boolean;
}

@Component({
  selector: 'nexora-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-[#EAECF0] divide-y divide-[#EAECF0] bg-white overflow-hidden shadow-xs">
      <div *ngFor="let item of items" class="transition-colors">
        <button
          type="button"
          (click)="toggle(item)"
          class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <span class="text-xs font-semibold text-[#101828]">{{ item.title }}</span>
          <svg
            class="w-4 h-4 text-[#667085] transition-transform duration-200"
            [class.rotate-180]="item.open"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
          </svg>
        </button>

        <div
          *ngIf="item.open"
          class="px-4 pb-4 pt-1 text-xs text-[#667085] leading-relaxed animate-in fade-in duration-150"
        >
          {{ item.content }}
        </div>
      </div>
    </div>
  `
})
export class NexoraAccordionComponent {
  @Input() items: AccordionSection[] = [];
  @Input() multiOpen = false;

  toggle(target: AccordionSection): void {
    if (!this.multiOpen) {
      this.items.forEach(it => {
        if (it !== target) it.open = false;
      });
    }
    target.open = !target.open;
  }
}
