import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dt-collab-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: inline-block; }'],
  template: `
    <button type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5
             text-[11px] font-medium shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
      [class.border-emerald-300]="active"
      [class.text-emerald-700]="active"
      [class.text-slate-700]="!active"
      (click)="toggle()"
      title="Toggle live collaboration bar">
      <span class="text-[12px]">{{ active ? '🟢' : '⚪' }}</span>
      <span>Live Collab</span>
      <span class="text-[10px] text-slate-400">({{ active ? 'On' : 'Off' }})</span>
    </button>
  `
})
export class CollabToggleComponent {
  @Input() active = true;
  @Output() activeChange = new EventEmitter<boolean>();

  toggle(): void {
    this.active = !this.active;
    this.activeChange.emit(this.active);
  }
}
