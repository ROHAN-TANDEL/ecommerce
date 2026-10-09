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
        title="Master Edit Filter Active"
      >
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs select-none" title="Master Edit Filter Active">
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
              class="w-full h-8 rounded-lg border border-blue-400 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs transition-colors"
            >
              <option value="">Apply {{ col.header_name }}...</option>
              <option *ngFor="let opt of col.filter_data" [value]="opt.key">
                {{ opt.name }}
              </option>
            </select>
          </div>

          <!-- Case 2: Clean single text input (Image 1: rounded-lg border border-blue-400) -->
          <ng-template #textInputBlock>
            <div class="relative flex items-center w-full">
              <input
                type="text"
                [placeholder]="'Apply ' + col.header_name + '...'"
                [value]="values[col.key] || ''"
                (input)="onInputChange(col, $any($event.target).value)"
                class="w-full h-8 rounded-lg border border-blue-400 bg-white px-3 pr-6 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal transition-colors shadow-2xs"
              />
              <button
                *ngIf="values[col.key]"
                type="button"
                (click)="clearValue(col, $event)"
                class="absolute right-2 text-slate-400 hover:text-slate-700 text-xs font-bold leading-none cursor-pointer p-0.5"
                title="Clear filter value"
              >
                &times;
              </button>
            </div>
          </ng-template>

        </ng-container>

        <!-- NON-EDITABLE COLUMN (col.editable !== true) -->
        <ng-template #nonEditableCell>
          <div class="flex items-center justify-center h-8 text-slate-300 font-mono text-xs select-none" [title]="col.header_name + ' is read-only'">
            —
          </div>
        </ng-template>
      </th>

      <!-- Action Column: Clear and Apply for Master Filters (Image 4) -->
      <th
        *ngIf="hasActionColumn"
        style="width: 120px; min-width: 120px; max-width: 120px;"
        class="w-[120px] min-w-[120px] max-w-[120px] px-2 py-1.5 bg-blue-50/90 sticky right-0 z-30 border-l border-blue-200 text-center"
      >
        <div class="flex items-center justify-center gap-1.5">
          <button
            type="button"
            (click)="onClearAll($event)"
            class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
            title="Clear all master edit filters"
          >
            Clear
          </button>
          <button
            type="button"
            (click)="onApplyAll($event)"
            class="px-3 py-1 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
            title="Apply master filters to selected rows"
          >
            Apply
          </button>
        </div>
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
  @Output() clearMasterFilters = new EventEmitter<void>();
  @Output() applyMasterFilters = new EventEmitter<void>();

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

  onClearAll(e: MouseEvent): void {
    e.stopPropagation();
    this.clearMasterFilters.emit();
  }

  onApplyAll(e: MouseEvent): void {
    e.stopPropagation();
    this.applyMasterFilters.emit();
  }
}

