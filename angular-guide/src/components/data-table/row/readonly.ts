import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { ColumnDef } from '../models/column-def.model';
import { PlainTextCell }             from '../cell/plain-text';
import { ImageAndPlainText }         from '../cell/image-text';
import { FlagAndPlainText }          from '../cell/flag-text';
import { NumberSeparationWithComma } from '../cell/number';
import { StatusBadgeCell }           from '../cell/status-badge';
import { ReadonlyCell }              from '../cell/readonly';

/** Standard readable row — no edit controls. */
@Component({
  selector: 'dt-row-readonly',
  standalone: true,
  imports: [CommonModule, PlainTextCell, ImageAndPlainText, FlagAndPlainText,
            NumberSeparationWithComma, StatusBadgeCell, ReadonlyCell],
  template: `
    <tr class="group border-b border-slate-100 transition-colors"
        [class.bg-white]="!zebra && !selected"
        [class.bg-slate-50/40]="zebra && !selected"
        [class.bg-blue-50/30]="selected">

      <td class="w-[54px] px-3 py-2.5 align-middle">
        <input type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
          [checked]="selected" (change)="selectedChange.emit(!selected)" />
      </td>

      <ng-container *ngFor="let col of columns">
        <td class="px-3 py-2.5 align-middle overflow-hidden" [style.width]="col.width">
          <dt-cell-readonly>
            <ng-container [ngSwitch]="col.format">
              <dt-cell-image-text *ngSwitchCase="'avatar'"
                [primary]="row[col.key] ?? ''"
                [secondary]="col.secondaryKey ? (row[col.secondaryKey] ?? '') : ''" />
              <dt-cell-flag-text *ngSwitchCase="'flag'"
                [flag]="flagEmoji()" [country]="row[col.key] ?? ''" />
              <dt-cell-status-badge *ngSwitchCase="'status'"
                [status]="row[col.key] ?? ''" />
              <dt-cell-number *ngSwitchCase="'number'"
                [value]="row[col.key] ?? 0"
                [prefix]="col.prefix ?? ''" [decimals]="col.decimals ?? 0" />
              <span *ngSwitchCase="'boolean'"
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                [class.bg-emerald-50]="row[col.key]" [class.text-emerald-700]="row[col.key]"
                [class.bg-slate-100]="!row[col.key]" [class.text-slate-500]="!row[col.key]">
                {{ row[col.key] ? 'Yes' : 'No' }}
              </span>
              <dt-cell-plain-text *ngSwitchCase="'date'" [value]="formatDate(row[col.key])" />
              <dt-cell-plain-text *ngSwitchDefault [value]="row[col.key] != null ? ('' + row[col.key]) : ''" />
            </ng-container>
          </dt-cell-readonly>
        </td>
      </ng-container>

      <td class="w-[120px] px-3 py-2.5 align-middle opacity-0 group-hover:opacity-100 transition-opacity">
        <ng-content select="[rowActions]" />
      </td>
    </tr>
  `,
})
export class ReadonlyRow {
  @Input() row: any = {};
  @Input() columns: ColumnDef[] = [];
  @Input() selected = false;
  @Input() zebra = false;
  @Output() selectedChange = new EventEmitter<boolean>();

  flagEmoji(): string {
    if (this.row.flag) return this.row.flag;
    const code = (this.row.country_code ?? '').toUpperCase();
    if (code.length !== 2) return '🌐';
    return [...code].map((c: string) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
  }

  formatDate(v: any): string {
    if (!v) return '';
    try { return new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return String(v); }
  }
}
