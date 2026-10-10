import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
}

@Component({
  selector: 'nexora-breadcrumbs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="flex items-center text-xs text-[#667085]" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1.5">
        <li *ngFor="let item of items; let last = last" class="inline-flex items-center">
          <div class="flex items-center gap-1.5">
            <span *ngIf="item.icon" class="text-xs text-[#98A2B3]">{{ item.icon }}</span>
            <button
              *ngIf="!last"
              type="button"
              (click)="navigate.emit(item)"
              class="font-medium hover:text-[#436CF3] transition-colors cursor-pointer"
            >
              {{ item.label }}
            </button>
            <span *ngIf="last" class="font-semibold text-[#1D2939]" aria-current="page">
              {{ item.label }}
            </span>
          </div>

          <!-- Separator -->
          <svg *ngIf="!last" class="w-3.5 h-3.5 text-[#D0D5DD] ml-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
          </svg>
        </li>
      </ol>
    </nav>
  `
})
export class NexoraBreadcrumbsComponent {
  @Input() items: BreadcrumbItem[] = [];

  @Output() navigate = new EventEmitter<BreadcrumbItem>();
}
