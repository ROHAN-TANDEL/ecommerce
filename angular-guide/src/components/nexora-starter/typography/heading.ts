import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-heading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-0.5">
      <span *ngIf="overline" class="text-[10px] font-bold uppercase tracking-wider text-[#436CF3] block">
        {{ overline }}
      </span>
      <h2
        class="font-bold text-[#101828] tracking-tight leading-snug"
        [class.text-xl]="level === 'h1'"
        [class.text-lg]="level === 'h2'"
        [class.text-sm]="level === 'h3'"
      >
        {{ title }}
      </h2>
      <p *ngIf="subtitle" class="text-xs text-[#667085] leading-relaxed">
        {{ subtitle }}
      </p>
    </div>
  `
})
export class NexoraHeadingComponent {
  @Input() title = 'Heading Title';
  @Input() subtitle = '';
  @Input() overline = '';
  @Input() level: 'h1' | 'h2' | 'h3' = 'h2';
}

@Component({
  selector: 'nexora-caption',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="text-[10px] text-[#667085] leading-tight block">
      <ng-content></ng-content>
    </span>
  `
})
export class NexoraCaptionComponent {}
