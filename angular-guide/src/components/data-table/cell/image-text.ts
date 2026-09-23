import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ImageText — Avatar + primary text + optional secondary text cell format.
 *
 * CELL level · Format: Avatar, Avatar + text
 *
 * Rules:
 *   • Interactive elements (avatar) remain visually distinguishable from plain text.
 *   • Long secondary text truncates — value stays inside its column area.
 */
@Component({
  selector: 'dt-cell-image-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-w-0 items-center gap-2.5">

      <!-- Avatar: image or auto-generated initials with gradient -->
      <div
        class="shrink-0 flex h-8 w-8 items-center justify-center rounded-full
               text-[11px] font-semibold text-white"
        [class.bg-gradient-to-br]="!src"
        [ngClass]="!src ? avatarGradient : ''"
        [title]="primary"
      >
        <img
          *ngIf="src"
          [src]="src"
          [alt]="primary"
          class="h-full w-full rounded-full object-cover"
        />
        <span *ngIf="!src">{{ initials }}</span>
      </div>

      <!-- Text block -->
      <div class="min-w-0 flex-1">
        <div class="truncate text-xs font-semibold text-[#0A173D]" [title]="primary">
          {{ primary }}
        </div>
        <div
          *ngIf="secondary"
          class="mt-0.5 truncate text-[10px] text-slate-400"
          [title]="secondary"
        >
          {{ secondary }}
        </div>
      </div>

    </div>
  `,
})
export class ImageAndPlainText {
  @Input() primary: string = '';
  @Input() secondary: string = '';
  @Input() src: string = '';

  get initials(): string {
    return this.primary.substring(0, 2).toUpperCase();
  }

  get avatarGradient(): string {
    const palettes = [
      'from-[#436CF3] to-[#3B32BC]',
      'from-violet-500 to-purple-700',
      'from-emerald-400 to-teal-600',
      'from-pink-400 to-rose-600',
      'from-amber-400 to-orange-500',
      'from-sky-400 to-blue-600',
    ];
    return palettes[(this.primary.charCodeAt(0) || 0) % palettes.length];
  }
}
