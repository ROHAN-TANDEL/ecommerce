import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrichedColumn } from '../employees.types';

@Component({
  selector: 'cell-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [':host { display: contents; }'],
  template: `
    <td
      [style.width]="column.computedWidth"
      [style.min-width]="column.computedWidth"
      [style.left]="column.stickyLeft || null"
      [class.sticky]="column.isFrozen"
      [class.z-10]="column.isFrozen"
      [class.border-r]="column.isFrozen"
      [class.border-slate-200]="column.isFrozen"
      [class.bg-slate-50]="column.isFrozen && isEven && !isSelected"
      [class.bg-white]="column.isFrozen && !isEven && !isSelected"
      [class.bg-blue-50]="column.isFrozen && isSelected"
      class="px-3.5 py-3 align-middle truncate"
    >
      <!-- Edit Mode: Editable inline input -->
      <ng-container *ngIf="isEditing && column.editable; else displayMode">
        <input
          type="text"
          [(ngModel)]="row[column.key]"
          (ngModelChange)="valueChange.emit({ key: column.key, value: $event })"
          class="w-full h-7 rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-slate-900"
        />
      </ng-container>

      <!-- Display Mode: Formatted according to cell_mode -->
      <ng-template #displayMode>
        <!-- CELL MODE 1: text_code_1000 (Plain text / Alphanumeric) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_1000'">
          <span class="font-medium text-slate-800">{{ row[column.key] }}</span>
        </ng-container>

        <!-- CELL MODE 2: text_code_2000 (Email / Linked contact) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_2000'">
          <div class="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
            <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="truncate">{{ row[column.key] }}</span>
          </div>
        </ng-container>

        <!-- CELL MODE 3: text_code_3100 (Status Badge) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_3100'">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            [ngClass]="{
              'bg-emerald-50 text-emerald-700 border border-emerald-200': (row[column.key] || '').toLowerCase() === 'active',
              'bg-amber-50 text-amber-700 border border-amber-200': (row[column.key] || '').toLowerCase() === 'pending',
              'bg-slate-100 text-slate-600 border border-slate-200': (row[column.key] || '').toLowerCase() === 'inactive'
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              [ngClass]="{
                'bg-emerald-500': (row[column.key] || '').toLowerCase() === 'active',
                'bg-amber-500': (row[column.key] || '').toLowerCase() === 'pending',
                'bg-slate-400': (row[column.key] || '').toLowerCase() === 'inactive'
              }"
            ></span>
            <span>{{ row[column.key] }}</span>
          </span>
        </ng-container>

        <!-- CELL MODE 4: text_code_4000 (Timestamp / Date) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_4000'">
          <span class="text-slate-500 text-[11px] font-mono">{{ row[column.key] }}</span>
        </ng-container>
      </ng-template>

    </td>
  `,
})
export class CellComponent {
  @Input({ required: true }) column!: EnrichedColumn;
  @Input({ required: true }) row!: Record<string, any>;
  @Input() isEven = false;
  @Input() isSelected = false;
  @Input() isEditing = false;
  @Output() valueChange = new EventEmitter<{ key: string; value: any }>();
}
