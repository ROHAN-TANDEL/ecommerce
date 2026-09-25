import {
  Component, Input, Output, EventEmitter,
  OnInit, OnChanges, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import type { ColumnDef } from '../models/column-def.model';
import { PlainTextCell }             from '../cell/plain-text';
import { ImageAndPlainText }         from '../cell/image-text';
import { FlagAndPlainText }          from '../cell/flag-text';
import { NumberSeparationWithComma } from '../cell/number';
import { StatusBadgeCell }           from '../cell/status-badge';
import { EditableCell }              from '../cell/editable';
import { ReadonlyCell }              from '../cell/readonly';

/** Row in active editing state. Blue left-accent via border-l-[3px], no inline style. */
@Component({
  selector: 'dt-row-editable',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule, PlainTextCell, ImageAndPlainText, FlagAndPlainText,
            NumberSeparationWithComma, StatusBadgeCell, EditableCell, ReadonlyCell],
  template: `
    <tr class="group border-b border-slate-200 border-l-[3px] border-l-[#436CF3]
               bg-blue-50 transition-colors"
        [class.bg-blue-100]="selected">

      <td *ngIf="showCheckboxes" class="w-[54px] px-3 align-middle bg-blue-50"
          [class.py-1.5]="density === 'compact'"
          [class.py-2.5]="density === 'comfortable'"
          [class.py-4]="density === 'spacious'"
          [class.sticky]="fixedCheckboxes"
          [class.left-0]="fixedCheckboxes"
          [class.z-[10]]="fixedCheckboxes">
        <div class="flex items-center gap-1.5">
          <input type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-[#436CF3]"
            [checked]="selected" [indeterminate]="masterSelected && !selected"
            (change)="selectedChange.emit(!selected)" />
          <span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full
                       bg-[#436CF3] text-[8px] font-bold text-white" title="Editing">✎</span>
        </div>
      </td>

      <ng-container *ngFor="let col of columns">
        <td class="px-3 align-middle"
            [class.py-2]="density === 'compact'"
            [class.py-2.5]="density === 'comfortable' || !density"
            [class.py-4]="density === 'spacious'"
            [style.width]="col.width"
            [class.sticky]="col.frozen"
            [class.z-[10]]="col.frozen"
            [class.bg-blue-100]="col.frozen"
            [class.border-r]="col.frozen && col.frozenSide !== 'right'"
            [class.border-l]="col.frozen && col.frozenSide === 'right'"
            [class.border-slate-200]="col.frozen"
            [style.left]="col.frozen && col.frozenSide !== 'right' ? frozenOffset(col) : null"
            [style.right]="col.frozen && col.frozenSide === 'right' ? frozenOffset(col) : null">

          <ng-container *ngIf="col.editable && row.editable; else roCell">
            <dt-cell-editable
              [value]="effectiveValue(col)"
              [placeholder]="'Enter ' + col.label"
              [inputType]="resolveInputType(col)"
              [options]="col.filterData"
              (valueChange)="onCellChange(col.key, $event)" />
          </ng-container>

          <ng-template #roCell>
            <dt-cell-readonly>
              <ng-container [ngSwitch]="col.format">
                <dt-cell-image-text *ngSwitchCase="'avatar'"
                  [primary]="row[col.key] ?? ''"
                  [secondary]="col.secondaryKey ? (row[col.secondaryKey] ?? '') : ''" />
                <dt-cell-flag-text *ngSwitchCase="'flag'"
                  [flag]="row.flag ?? ''" [country]="row[col.key] ?? ''" />
                <dt-cell-status-badge *ngSwitchCase="'status'"
                  [status]="row[col.key] ?? ''" />
                <dt-cell-number *ngSwitchCase="'number'"
                  [value]="row[col.key] ?? 0"
                  [prefix]="col.prefix ?? ''" [decimals]="col.decimals ?? 0" />
                <dt-cell-plain-text *ngSwitchDefault [value]="formatValue(col, row[col.key])" />
              </ng-container>
            </dt-cell-readonly>
          </ng-template>
        </td>
      </ng-container>

      <td *ngIf="showActions" class="w-[120px] px-3 align-middle bg-blue-50"
          [class.py-1.5]="density === 'compact'"
          [class.py-2.5]="density === 'comfortable'"
          [class.py-4]="density === 'spacious'"
          [class.sticky]="fixedActions"
          [class.right-0]="fixedActions"
          [class.z-[10]]="fixedActions"
          [class.border-l]="fixedActions"
          [class.border-l-slate-200]="fixedActions">
        <ng-content select="[rowActions]" />
      </td>
    </tr>
  `,
})
export class EditableRow implements OnInit, OnChanges {
  @Input() row: any = {};
  @Input() columns: ColumnDef[] = [];
  @Input() selected = false;
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Input() masterSelected = false;
  @Input() masterEditValues: Record<string, any> = {};
  @Input() fixedCheckboxes = false;
  @Input() fixedActions = false;
  @Input() showCheckboxes = true;
  @Input() showActions = true;
  @Input() frozenOffset: (col: ColumnDef) => string = () => '0px';
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() cellChange = new EventEmitter<{ key: string; value: any }>();

  private _original: Record<string, any> = {};
  private _snapped = false;

  ngOnInit(): void { this.snapshot(); }
  ngOnChanges(): void { if (!this._snapped) this.snapshot(); }

  private snapshot(): void {
    if (this.row && Object.keys(this.row).length) {
      this._original = { ...this.row };
      this._snapped = true;
    }
  }

  effectiveValue(col: ColumnDef): any {
    if (col.masterEditAllow && this.masterEditValues[col.key] !== undefined) {
      return this.masterEditValues[col.key];
    }
    return this.row[col.key] ?? '';
  }

  onCellChange(key: string, value: any): void {
    this.row[key] = value;
    this.cellChange.emit({ key, value });
  }

  resolveInputType(col: ColumnDef): 'text' | 'number' | 'date' | 'select' | 'boolean' {
    if (col.format === 'boolean') return 'boolean';
    if (col.format === 'number')  return 'number';
    if (col.format === 'date')    return 'date';
    if (col.filterType === 'list' || col.filterType === 'multi_list') return 'select';
    return 'text';
  }

  formatValue(col: ColumnDef, v: any): string {
    if (v == null) return '';
    if (col.format === 'boolean') return v ? 'Yes' : 'No';
    if (col.format === 'date') {
      try { return new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
      catch { return String(v); }
    }
    return String(v);
  }
}
