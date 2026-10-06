import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrichedColumn } from '../employees.types';

@Component({
  selector: 'section-row-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [':host { display: contents; }'],
  template: `
    <tr class="bg-blue-50/60 border-b border-blue-200 text-xs transition-colors">

      <!-- Checkbox Column Indicator (Sticky left, z-30, opaque) -->
      <th
        *ngIf="hasCheckboxColumn"
        style="width: 50px; min-width: 50px; max-width: 50px;"
        class="w-[50px] min-w-[50px] max-w-[50px] px-2 py-1.5 bg-blue-50/90 sticky left-0 z-30 border-r border-blue-200 text-center"
        title="Bulk Edit Row"
      >
        <span class="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white font-bold text-[10px] shadow-2xs select-none" title="Bulk Update Row">
          ✎
        </span>
      </th>

      <!-- Dynamic Column Bulk Edit Cells -->
      <th
        *ngFor="let col of columns"
        [style.width]="col.computedWidth"
        [style.min-width]="col.computedWidth"
        [style.left]="col.stickyLeft || null"
        [class.sticky]="col.isFrozen"
        [class.z-20]="col.isFrozen"
        [class.z-0]="!col.isFrozen"
        [class.border-r]="col.isFrozen"
        [class.border-blue-200]="col.isFrozen"
        [class.bg-blue-50/90]="col.isFrozen"
        [class.bg-blue-50/50]="!col.isFrozen"
        class="px-2 py-1.5 align-middle font-normal"
      >
        <!-- EDITABLE COLUMN CONTROLS (Only rendered when col.editable === true) -->
        <ng-container *ngIf="col.editable; else nonEditableCell">

          <!-- Case 1: List / Dropdown / Status option select -->
          <div *ngIf="col.filter_type === 'list' && col.filter_data && col.filter_data.length > 0; else textInputBlock" class="w-full relative">
            <select
              [value]="values[col.key] || ''"
              (change)="onSelectChange(col, $any($event.target).value)"
              class="w-full h-7 rounded-md border border-blue-300 bg-white px-2 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-2xs transition-colors"
            >
              <option value="">Apply {{ col.header_name }}...</option>
              <option *ngFor="let opt of col.filter_data" [value]="opt.key">
                {{ opt.name }}
              </option>
            </select>
          </div>

          <!-- Case 2: Clean single text input (No multi-search; applies directly to following cells) -->
          <ng-template #textInputBlock>
            <div class="relative flex items-center w-full">
              <input
                type="text"
                [placeholder]="'Apply ' + col.header_name + '...'"
                [value]="values[col.key] || ''"
                (input)="onInputChange(col, $any($event.target).value)"
                class="w-full h-7 rounded-md border border-blue-300 bg-white px-2 pr-6 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-normal transition-colors shadow-2xs"
              />
              <button
                *ngIf="values[col.key]"
                type="button"
                (click)="clearValue(col, $event)"
                class="absolute right-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold leading-none cursor-pointer p-0.5"
                title="Clear bulk value"
              >
                &times;
              </button>
            </div>
          </ng-template>

        </ng-container>

        <!-- NON-EDITABLE COLUMN (col.editable !== true) -->
        <ng-template #nonEditableCell>
          <div class="flex items-center justify-center h-7 text-slate-300 font-mono text-xs select-none" [title]="col.header_name + ' is read-only'">
            —
          </div>
        </ng-template>
      </th>

      <!-- Action Column Placeholder (Sticky right, z-30, opaque) -->
      <th
        *ngIf="hasActionColumn"
        style="width: 110px; min-width: 110px; max-width: 110px;"
        class="w-[110px] min-w-[110px] max-w-[110px] px-2 py-1.5 bg-blue-50/90 sticky right-0 z-30 border-l border-blue-200 text-center"
      >
        <span class="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          Bulk Edit
        </span>
      </th>

    </tr>
  `,
})
export class SectionRowComponent {
  @Input({ required: true }) columns: EnrichedColumn[] = [];
  @Input() values: Record<string, any> = {};
  @Input() hasCheckboxColumn = true;
  @Input() hasActionColumn = true;
  @Output() sectionChange = new EventEmitter<{ col: EnrichedColumn; value: string }>();
  @Output() sectionAction = new EventEmitter<{ col: EnrichedColumn; action: string }>();

  onInputChange(col: EnrichedColumn, val: string): void {
    this.sectionChange.emit({ col, value: val });
  }

  onSelectChange(col: EnrichedColumn, val: string): void {
    this.sectionChange.emit({ col, value: val });
  }

  clearValue(col: EnrichedColumn, e?: Event): void {
    if (e) e.stopPropagation();
    this.sectionChange.emit({ col, value: '' });
  }
}
