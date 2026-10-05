import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-fab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
      [title]="tooltip || label"
      class="inline-flex items-center justify-center rounded-full bg-[#436CF3] hover:bg-[#3459D9] active:bg-[#2B49B8] text-white shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none group"
      [class.w-12]="!label"
      [class.h-12]="!label"
      [class.h-11]="!!label"
      [class.px-4]="!!label"
      [class.gap-2]="!!label"
    >
      <span class="text-lg leading-none">{{ icon }}</span>
      <span *ngIf="label" class="text-xs font-semibold tracking-wide">{{ label }}</span>
    </button>
  `
})
export class NexoraFabComponent {
  @Input() icon = '+';
  @Input() label = '';
  @Input() tooltip = '';
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<MouseEvent>();
}
