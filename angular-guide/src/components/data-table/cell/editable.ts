import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  key: string;
  name: string;
}

/**
 * Editable — Active input presentation for a cell in edit mode.
 *
 * CELL level · State: editable, focused
 *
 * Supports multiple input types driven by column config:
 *   text    → standard text input (default)
 *   number  → numeric input, right-aligned
 *   date    → date picker input
 *   select  → dropdown select (uses options[])
 *   boolean → Yes/No toggle buttons
 *
 * Rules:
 *   • Visually distinguishable from read-only (blue border + focus ring).
 *   • Height matches the row's line height — does not unpredictably expand the row.
 *   • Content stays inside the allocated column area (w-full).
 * Constraints:
 *   • Only rendered when Column.editable AND Row.editing AND Row.editable are all true.
 *   • Type must match the column's declared type — validated at the row/table level.
 */
@Component({
  selector: 'dt-cell-editable',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- text / number / date -->
    <ng-container *ngIf="inputType !== 'select' && inputType !== 'boolean'">
      <input
        [type]="inputType === 'number' ? 'number' : inputType === 'date' ? 'date' : 'text'"
        class="h-8 w-full rounded-md border border-[#436CF3] bg-white px-2.5 text-xs
               text-slate-700 outline-none ring-0 transition
               focus:ring-2 focus:ring-blue-200/70 placeholder:text-slate-400"
        [class.text-right]="inputType === 'number'"
        [class.tabular-nums]="inputType === 'number'"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
        [placeholder]="placeholder"
        [attr.aria-label]="ariaLabel"
      />
    </ng-container>

    <!-- select -->
    <ng-container *ngIf="inputType === 'select'">
      <select
        class="h-8 w-full rounded-md border border-[#436CF3] bg-white px-2 text-xs
               text-slate-700 outline-none focus:ring-2 focus:ring-blue-200/70"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
        [attr.aria-label]="ariaLabel"
      >
        <option value="">— select —</option>
        <option *ngFor="let opt of options" [value]="opt.key">{{ opt.name }}</option>
      </select>
    </ng-container>

    <!-- boolean toggle -->
    <ng-container *ngIf="inputType === 'boolean'">
      <div class="flex h-8 overflow-hidden rounded-md border border-[#436CF3]">
        <button type="button"
          class="flex-1 text-[10px] font-medium transition-colors"
          [class.bg-[#436CF3]]="value === 'true' || value === true"
          [class.text-white]="value === 'true' || value === true"
          [class.text-slate-500]="value !== 'true' && value !== true"
          (click)="valueChange.emit('true')">Yes</button>
        <button type="button"
          class="flex-1 text-[10px] font-medium transition-colors border-l border-[#436CF3]"
          [class.bg-[#436CF3]]="value === 'false' || value === false"
          [class.text-white]="value === 'false' || value === false"
          [class.text-slate-500]="value !== 'false' && value !== false"
          (click)="valueChange.emit('false')">No</button>
      </div>
    </ng-container>
  `,
})
export class EditableCell {
  @Input() value: any = '';
  @Input() placeholder: string = 'Enter value…';
  @Input() ariaLabel: string = 'Editable cell';
  @Input() inputType: 'text' | 'number' | 'date' | 'select' | 'boolean' = 'text';
  @Input() options: SelectOption[] = [];

  @Output() valueChange = new EventEmitter<any>();
}
