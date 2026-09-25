import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { ColumnDef } from '../models/column-def.model';
import { PlainTextCell }             from '../cell/plain-text';
import { ImageAndPlainText }         from '../cell/image-text';
import { FlagAndPlainText }          from '../cell/flag-text';
import { NumberSeparationWithComma } from '../cell/number';
import { StatusBadgeCell }           from '../cell/status-badge';
import { ReadonlyCell }              from '../cell/readonly';

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

      <!-- Checkbox cell — sticky when fixedCheckboxes -->
      <td *ngIf="showCheckboxes" class="w-[54px] px-3 align-middle"
          [class.bg-white]="!zebra && !selected" [class.bg-slate-50]="zebra && !selected" [class.bg-blue-50]="selected"
          [class.py-1.5]="density === 'compact'" [class.py-2.5]="density === 'comfortable'" [class.py-4]="density === 'spacious'"
          [class.sticky]="fixedCheckboxes"
          [class.left-0]="fixedCheckboxes"
          [class.z-[5]]="fixedCheckboxes">
        <div class="flex items-center gap-1.5">
          <input type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
            [checked]="selected" (change)="selectedChange.emit(!selected)" />
          <svg *ngIf="row.editable === false"
            class="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
            title="This row cannot be edited">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
      </td>

      <!-- Data cells -->
      <ng-container *ngFor="let col of columns">
        <td class="px-3 align-middle overflow-hidden text-center"
            [class.bg-white]="!zebra && !selected" [class.bg-slate-50]="zebra && !selected" [class.bg-blue-50]="selected"
            [class.py-1.5]="density === 'compact'" [class.py-2.5]="density === 'comfortable'" [class.py-4]="density === 'spacious'"
            [style.width]="col.width"
            [class.sticky]="col.frozen"
            [class.z-[5]]="col.frozen"
            [class.bg-[#F4F7FF]]="col.frozen"
            [class.border-r]="col.frozen && col.frozenSide !== 'right'"
            [class.border-l]="col.frozen && col.frozenSide === 'right'"
            [class.border-slate-200]="col.frozen"
            [style.left]="col.frozen && col.frozenSide !== 'right' ? frozenOffset(col) : null"
            [style.right]="col.frozen && col.frozenSide === 'right' ? frozenOffset(col) : null">
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
              <dt-cell-plain-text *ngSwitchDefault
                [value]="row[col.key] != null ? ('' + row[col.key]) : ''" />
            </ng-container>
          </dt-cell-readonly>
        </td>
      </ng-container>

      <!-- Actions — always visible, sticky when fixedActions -->
      <td *ngIf="showActions" class="w-[120px] px-3 align-middle hover:z-[60] focus-within:z-[60]"
          [class.bg-white]="!zebra && !selected" [class.bg-slate-50]="zebra && !selected" [class.bg-blue-50]="selected"
          [class.py-1.5]="density === 'compact'" [class.py-2.5]="density === 'comfortable'" [class.py-4]="density === 'spacious'"
          [class.sticky]="fixedActions"
          [class.right-0]="fixedActions"
          [class.z-[5]]="fixedActions"
          [class.border-l]="fixedActions"
          [class.border-l-slate-200]="fixedActions">
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
  @Input() fixedCheckboxes = false;
  @Input() fixedActions = false;
  @Input() showCheckboxes = true;
  @Input() showActions = true;
  @Input() frozenOffset: (col: ColumnDef) => string = () => '0px';
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
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
