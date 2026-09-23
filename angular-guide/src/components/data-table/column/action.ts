import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RowAction {
  key: string;
  label: string;
  icon: string;
  requiresEditable?: boolean;
  requiresDeletable?: boolean;
}

/**
 * ActionColumn — row action buttons.
 * Renders ONLY the inner flex container, NOT a <td>.
 * The parent row component owns the <td> so column widths stay consistent.
 */
@Component({
  selector: 'dt-col-action',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-end gap-0.5">

      <ng-container *ngFor="let action of primaryActions">
        <button type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md
                 text-slate-400 text-sm transition-colors
                 hover:bg-blue-50 hover:text-[#436CF3]
                 disabled:cursor-not-allowed disabled:opacity-30
                 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          [disabled]="isDisabled(action)"
          [title]="action.label"
          [attr.aria-label]="action.label"
          (click)="!isDisabled(action) && actionFired.emit({ action: action.key, row })">
          {{ action.icon }}
        </button>
      </ng-container>

      <div class="relative" *ngIf="overflowActions.length > 0">
        <button type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md
                 text-slate-400 text-sm transition-colors hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="showOverflow = !showOverflow; $event.stopPropagation()"
          title="More actions">⋯</button>

        <div *ngIf="showOverflow"
          class="absolute right-0 bottom-8 z-50 min-w-[150px] rounded-lg
                 border border-slate-200 bg-white p-1.5 shadow-xl"
          (click)="$event.stopPropagation()">
          <button *ngFor="let action of overflowActions" type="button"
            class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5
                   text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]
                   disabled:opacity-30 disabled:cursor-not-allowed"
            [disabled]="isDisabled(action)"
            (click)="!isDisabled(action) && actionFired.emit({ action: action.key, row }); showOverflow = false">
            <span>{{ action.icon }}</span> {{ action.label }}
          </button>
        </div>
      </div>

    </div>
  `,
})
export class ActionColumn {
  @Input() row: any = {};
  @Input() actions: RowAction[] = [];
  @Output() actionFired = new EventEmitter<{ action: string; row: any }>();

  showOverflow = false;

  get primaryActions(): RowAction[] { return this.actions.slice(0, 2); }
  get overflowActions(): RowAction[] { return this.actions.slice(2); }

  isDisabled(action: RowAction): boolean {
    if (action.requiresEditable && !this.row?.editable) return true;
    if (action.requiresDeletable && !this.row?.deletable) return true;
    return false;
  }
}
