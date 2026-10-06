import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'master-component',
  standalone: true,
  imports: [CommonModule],
  styles: [':host { display: contents; }'],
  template: `
    <th
      style="width: 50px; min-width: 50px; max-width: 50px;"
      class="w-[50px] min-w-[50px] max-w-[50px] px-3 py-3 bg-slate-50 sticky left-0 z-30 border-r border-slate-200 text-center select-none"
    >
      <input
        *ngIf="showCheckbox"
        type="checkbox"
        [checked]="checked"
        [indeterminate]="indeterminate"
        [disabled]="disabled"
        (change)="onToggle($event)"
        class="w-3.5 h-3.5 rounded border-slate-300 accent-slate-900 cursor-pointer disabled:cursor-not-allowed"
        title="Select all rows"
      />
      <span *ngIf="!showCheckbox" class="text-[10px] text-slate-400 font-mono">#</span>
    </th>
  `,
})
export class MasterComponent {
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() disabled = false;
  @Input() showCheckbox = true;
  @Output() masterToggle = new EventEmitter<boolean>();

  onToggle(e: Event): void {
    const isChecked = (e.target as HTMLInputElement).checked;
    this.masterToggle.emit(isChecked);
  }
}
