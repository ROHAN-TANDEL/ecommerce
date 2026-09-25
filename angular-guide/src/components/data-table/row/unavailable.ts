import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { ColumnDef } from '../models/column-def.model';
import { PlainTextCell }             from '../cell/plain-text';
import { ImageAndPlainText }         from '../cell/image-text';
import { FlagAndPlainText }          from '../cell/flag-text';
import { NumberSeparationWithComma } from '../cell/number';
import { StatusBadgeCell }           from '../cell/status-badge';
import { UnavailableCell }           from '../cell/unavailable';

/** Row in error or warning state with optional per-cell overrides. */
@Component({
  selector: 'dt-row-unavailable',
  standalone: true,
  imports: [CommonModule, PlainTextCell, ImageAndPlainText, FlagAndPlainText,
            NumberSeparationWithComma, StatusBadgeCell, UnavailableCell],
  template: `
    <tr class="group border-b transition-colors"
        [class.border-l-[3px]]="rowState !== 'normal'"
        [class.border-l-red-400]="rowState === 'error'"
        [class.bg-red-50]="rowState === 'error'"
        [class.border-l-amber-400]="rowState === 'warning'"
        [class.bg-amber-50]="rowState === 'warning'"
        [class.border-slate-100]="rowState === 'normal'"
        [class.bg-white]="rowState === 'normal'">

      <td *ngIf="showCheckboxes" class="w-[54px] px-3 align-middle"
          [class.bg-red-50]="rowState === 'error'" [class.bg-amber-50]="rowState === 'warning'" [class.bg-white]="rowState === 'normal'"
          [class.py-1.5]="density === 'compact'" [class.py-2.5]="density === 'comfortable'" [class.py-4]="density === 'spacious'"
          [class.sticky]="fixedCheckboxes" [class.left-0]="fixedCheckboxes" [class.z-[10]]="fixedCheckboxes">
        <div class="flex items-center gap-1.5">
          <input type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
            [checked]="selected" (change)="selectedChange.emit(!selected)" />
          <span *ngIf="rowState === 'error'" class="text-[10px] text-red-400">⚠</span>
          <span *ngIf="rowState === 'warning'" class="text-[10px] text-amber-400">▲</span>
        </div>
      </td>

      <ng-container *ngFor="let col of columns">
        <td class="px-3 align-middle" [style.width]="col.width"
            [class.py-1.5]="density === 'compact'" [class.py-2.5]="density === 'comfortable'" [class.py-4]="density === 'spacious'"
            [class.sticky]="col.frozen" [class.z-[10]]="col.frozen" [class.bg-[#FFFDF2]]="col.frozen"
            [style.left]="col.frozen && col.frozenSide !== 'right' ? frozenOffset(col) : null"
            [style.right]="col.frozen && col.frozenSide === 'right' ? frozenOffset(col) : null">
          <ng-container *ngIf="errorCells.includes(col.key)">
            <dt-cell-unavailable state="error" [message]="errorMessage" />
          </ng-container>
          <ng-container *ngIf="!errorCells.includes(col.key) && warningCells.includes(col.key)">
            <dt-cell-unavailable state="warning" [message]="warningMessage" />
          </ng-container>
          <ng-container *ngIf="!errorCells.includes(col.key) && !warningCells.includes(col.key)">
            <ng-container [ngSwitch]="col.format">
              <dt-cell-image-text *ngSwitchCase="'avatar'"
                [primary]="row[col.key] ?? ''"
                [secondary]="col.secondaryKey ? (row[col.secondaryKey] ?? '') : ''" />
              <dt-cell-flag-text *ngSwitchCase="'flag'"
                [flag]="row.flag ?? ''" [country]="row[col.key] ?? ''" />
              <dt-cell-status-badge *ngSwitchCase="'status'"
                [status]="row[col.key] ?? ''" />
              <dt-cell-number *ngSwitchCase="'number'"
                [value]="row[col.key] ?? 0" [prefix]="col.prefix ?? ''" />
              <dt-cell-plain-text *ngSwitchDefault
                [value]="row[col.key] != null ? ('' + row[col.key]) : ''" />
            </ng-container>
          </ng-container>
        </td>
      </ng-container>

      <td *ngIf="showActions" class="w-[120px] px-3 align-middle hover:z-[60] focus-within:z-[60]"
          [class.bg-red-50]="rowState === 'error'" [class.bg-amber-50]="rowState === 'warning'" [class.bg-white]="rowState === 'normal'"
          [class.py-1.5]="density === 'compact'" [class.py-2.5]="density === 'comfortable'" [class.py-4]="density === 'spacious'"
          [class.sticky]="fixedActions" [class.right-0]="fixedActions" [class.z-[10]]="fixedActions">
        <ng-content select="[rowActions]" />
      </td>
    </tr>
  `,
})
export class UnavailableRow {
  @Input() row: any = {};
  @Input() columns: ColumnDef[] = [];
  @Input() selected = false;
  @Input() rowState: 'error' | 'warning' | 'normal' = 'normal';
  @Input() errorCells: string[] = [];
  @Input() errorMessage = 'Error';
  @Input() warningCells: string[] = [];
  @Input() warningMessage = 'Warning';
  @Input() fixedCheckboxes = false;
  @Input() fixedActions = false;
  @Input() showCheckboxes = true;
  @Input() showActions = true;
  @Input() frozenOffset: (col: ColumnDef) => string = () => '0px';
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Output() selectedChange = new EventEmitter<boolean>();
}
