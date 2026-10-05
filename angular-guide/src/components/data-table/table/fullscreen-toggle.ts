import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dt-fullscreen-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: inline-block; }'],
  template: `
    <button type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5
             text-[11px] font-medium shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
      [class.text-[#436CF3]]="fullscreen"
      [class.border-[#436CF3]]="fullscreen"
      [class.text-slate-700]="!fullscreen"
      (click)="toggle()"
      [title]="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'">
      <span class="text-[13px]">{{ fullscreen ? '⛶' : '⛶' }}</span>
      <span>{{ fullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}</span>
    </button>
  `
})
export class FullscreenToggleComponent {
  @Input() fullscreen = false;
  @Output() fullscreenChange = new EventEmitter<boolean>();

  toggle(): void {
    this.fullscreen = !this.fullscreen;
    this.fullscreenChange.emit(this.fullscreen);
  }
}
