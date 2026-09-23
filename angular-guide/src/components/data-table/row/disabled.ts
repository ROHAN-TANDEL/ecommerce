import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { ColumnDef } from '../models/column-def.model';
import { PlainTextCell }             from '../cell/plain-text';
import { ImageAndPlainText }         from '../cell/image-text';
import { FlagAndPlainText }          from '../cell/flag-text';
import { NumberSeparationWithComma } from '../cell/number';
import { StatusBadgeCell }           from '../cell/status-badge';
import { DisabledCell }              from '../cell/disabled';

/** Fully disabled row — pointer-events none, all cells muted. */
@Component({
  selector: 'dt-row-disabled',
  standalone: true,
  imports: [CommonModule, PlainTextCell, ImageAndPlainText, FlagAndPlainText,
            NumberSeparationWithComma, StatusBadgeCell, DisabledCell],
  template: `
    <tr class="border-b border-slate-100 bg-slate-50/40 pointer-events-none select-none"
        aria-disabled="true">

      <td class="w-[54px] px-3 py-2.5 align-middle">
        <div class="flex items-center gap-1 opacity-30">
          <input type="checkbox" class="h-4 w-4 rounded border-slate-300" disabled />
          <span class="text-[11px] text-slate-400">⊘</span>
        </div>
      </td>

      <ng-container *ngFor="let col of columns">
        <td class="px-3 py-2.5 align-middle overflow-hidden" [style.width]="col.width">
          <dt-cell-disabled>
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
              <dt-cell-plain-text *ngSwitchDefault [value]="row[col.key] != null ? ('' + row[col.key]) : ''" />
            </ng-container>
          </dt-cell-disabled>
        </td>
      </ng-container>

      <td class="w-[120px] px-3 py-2.5 align-middle">
        <div class="opacity-20 pointer-events-none"><ng-content select="[rowActions]" /></div>
      </td>
    </tr>
  `,
})
export class DisabledRow {
  @Input() row: any = {};
  @Input() columns: ColumnDef[] = [];
}
