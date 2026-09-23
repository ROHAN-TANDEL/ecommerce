import {
  Component, Input, Output, EventEmitter,
  HostListener, ElementRef, ViewChild, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import type { ColumnDef } from '../models/column-def.model';
import type { ActionsConfig, ExportConfig, DownloadConfig, ColumnManagementConfig, FeaturesConfig } from '../models/table-config.model';

export type ActionKey = 'edit' | 'delete' | 'enable' | 'disable' | 'revert';
export type ActionState = 'enabled' | 'disabled' | 'not_available';

export interface ActionBarState {
  edit: ActionState;
  delete: ActionState;
  enable: ActionState;
  disable: ActionState;
  revert: ActionState;
}

export interface GenerateInfo {
  generated: boolean;
  generatedAt?: string;   // ISO date
  generatedBy?: string;
  downloadedAt?: string;
}

/**
 * ToolbarActions — the full action / control bar above the table.
 *
 * TABLE level · covers the entire top strip:
 *   Left  — selection count · Edit · Delete · Enable · Disable · Revert · More
 *   Right — Export · Generate · Download · Column nav · Fullscreen · View · Density · Columns
 *
 * Every section is flag-driven from TableConfig.
 * Nothing is rendered that the config disables.
 *
 * Action state rules:
 *   enabled       — button shown, normal style, clickable
 *   disabled      — button shown, greyed, not clickable, tooltip on hover
 *   not_available — button not rendered
 */
@Component({
  selector: 'dt-toolbar-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host { display: block; }
    .tb-btn {
      @apply inline-flex h-[34px] items-center gap-1.5 rounded-md px-2.5 text-[11px]
             font-medium text-slate-600 transition-colors;
    }
    .tb-btn:not(:disabled):hover { @apply bg-blue-50 text-[#436CF3]; }
    .tb-btn:disabled { @apply cursor-not-allowed opacity-40; }
    .tb-icon {
      @apply inline-flex h-[30px] w-[30px] items-center justify-center rounded-md
             border border-slate-200 bg-white text-[13px] text-slate-500 transition-colors;
    }
    .tb-icon:hover { @apply bg-slate-50 text-[#436CF3]; }
    .tb-icon.active { @apply border-[#436CF3] text-[#436CF3]; }
    .drop { @apply absolute z-50 mt-1 min-w-[200px] rounded-lg border border-slate-200
                   bg-white p-1.5 shadow-xl; }
    .drop-item {
      @apply flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
             text-[11px] text-slate-700 transition-colors;
    }
    .drop-item:hover { @apply bg-blue-50 text-[#436CF3]; }
    .drop-label {
      @apply px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400;
    }
    .drop-sep { @apply my-1 border-t border-slate-100; }
    .col-item {
      @apply flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-slate-700;
    }
    .col-item:hover { @apply bg-slate-50; }
  `],
  template: `
  <div class="flex min-h-[46px] items-center justify-between gap-2 rounded-lg
              border border-[#436CF3]/25 bg-gradient-to-r from-blue-50/60 to-white px-3 py-1.5">

    <!-- ───────────────────────── LEFT: action buttons ───────────────────────── -->
    <div class="flex items-center gap-0.5">

      <!-- Selection info -->
      <div *ngIf="selectionCount > 0"
        class="mr-2 flex items-center gap-2 border-r border-slate-200 pr-3">
        <span class="text-[11px] font-semibold text-[#436CF3]">{{ selectionCount }}</span>
        <span class="text-[11px] text-slate-500">selected</span>
      </div>

      <!-- Edit -->
      <ng-container *ngIf="actions.edit && actionState.edit !== 'not_available'">
        <button type="button" class="tb-btn"
          [disabled]="actionState.edit === 'disabled'"
          [title]="editTooltip"
          (click)="actionState.edit === 'enabled' && actionClicked.emit('edit')">
          <span>✎</span> Edit
        </button>
      </ng-container>

      <!-- Delete -->
      <ng-container *ngIf="actions.delete && actionState.delete !== 'not_available'">
        <button type="button" class="tb-btn"
          [disabled]="actionState.delete === 'disabled'"
          [title]="actionState.delete === 'disabled' ? 'Select rows to delete' : 'Delete selected'"
          (click)="actionState.delete === 'enabled' && actionClicked.emit('delete')">
          <span>🗑</span> Delete
        </button>
      </ng-container>

      <!-- Enable -->
      <ng-container *ngIf="actions.enable && actionState.enable !== 'not_available'">
        <button type="button" class="tb-btn"
          [disabled]="actionState.enable === 'disabled'"
          [title]="actionState.enable === 'disabled' ? 'Select rows to enable' : 'Enable selected'"
          (click)="actionState.enable === 'enabled' && actionClicked.emit('enable')">
          <span>✓</span> Enable
        </button>
      </ng-container>

      <!-- Disable -->
      <ng-container *ngIf="actions.disable && actionState.disable !== 'not_available'">
        <button type="button" class="tb-btn"
          [disabled]="actionState.disable === 'disabled'"
          [title]="actionState.disable === 'disabled' ? 'Select rows to disable' : 'Disable selected'"
          (click)="actionState.disable === 'enabled' && actionClicked.emit('disable')">
          <span>◉</span> Disable
        </button>
      </ng-container>

      <!-- Revert -->
      <ng-container *ngIf="actions.revert && actionState.revert !== 'not_available'">
        <button type="button" class="tb-btn"
          [disabled]="actionState.revert === 'disabled'"
          [title]="actionState.revert === 'disabled' ? 'Select rows to revert' : 'Revert changes'"
          (click)="actionState.revert === 'enabled' && actionClicked.emit('revert')">
          <span>↶</span> Revert
        </button>
      </ng-container>

      <!-- More (left) -->
      <ng-container *ngIf="actions.more">
        <div class="relative" (click)="$event.stopPropagation()">
          <button type="button" class="tb-btn" (click)="toggle('left-more')">
            <span>⋮</span> More <span class="text-[9px]">⌄</span>
          </button>
          <div *ngIf="open === 'left-more'" class="drop left-0 top-full">
            <button type="button" class="drop-item" (click)="emit('view-details')">
              <span>◉</span> View details
            </button>
            <button type="button" class="drop-item" (click)="emit('duplicate')">
              <span>⧉</span> Duplicate selection
            </button>
            <div class="drop-sep"></div>
            <button type="button" class="drop-item" (click)="emit('reset-all')">
              <span>↶</span> Reset all changes
            </button>
          </div>
        </div>
      </ng-container>

    </div>

    <!-- ───────────────────────── RIGHT: controls ────────────────────────────── -->
    <div class="flex items-center gap-1.5">

      <!-- Export -->
      <ng-container *ngIf="exportConfig.enabled">
        <div class="relative" (click)="$event.stopPropagation()">
          <button type="button" class="tb-btn" (click)="toggle('export')"
            title="Export data">
            <span>⇪</span> Export <span class="text-[9px]">⌄</span>
          </button>
          <div *ngIf="open === 'export'" class="drop right-0 top-full w-48">
            <div class="drop-label">Export format</div>
            <button *ngFor="let fmt of exportConfig.formats" type="button"
              class="drop-item"
              (click)="exportClicked.emit(fmt); close()">
              <span class="w-6 text-center font-semibold">{{ fmt === 'excel' ? 'X' : 'CSV' }}</span>
              <span class="flex-1">{{ fmt === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)' }}</span>
              <span *ngIf="fmt === 'excel'" class="text-[10px] text-slate-400">max 10k rows</span>
            </button>
          </div>
        </div>
      </ng-container>

      <!-- Generate -->
      <ng-container *ngIf="downloadConfig.enabled">
        <button type="button" class="tb-btn"
          [title]="generateTooltip"
          (click)="generateClicked.emit()">
          <span>⟳</span> Generate
        </button>

        <!-- Download -->
        <div class="relative" (click)="$event.stopPropagation()">
          <button type="button" class="tb-btn"
            [title]="downloadTooltip"
            (click)="downloadConfig.formats.length > 1 ? toggle('download') : downloadClicked.emit(downloadConfig.formats[0])">
            <span>⇩</span> Download
            <span *ngIf="downloadConfig.formats.length > 1" class="text-[9px]">⌄</span>
          </button>
          <div *ngIf="open === 'download'" class="drop right-0 top-full w-48">
            <div class="drop-label">Download format</div>
            <button *ngFor="let fmt of downloadConfig.formats" type="button"
              class="drop-item"
              (click)="downloadClicked.emit(fmt); close()">
              <span class="w-6 text-center font-semibold">{{ fmt === 'excel' ? 'X' : 'CSV' }}</span>
              {{ fmt === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)' }}
            </button>
          </div>
        </div>
      </ng-container>

      <!-- Divider -->
      <div class="mx-0.5 h-5 w-px bg-slate-200"></div>

      <!-- Column navigation -->
      <ng-container *ngIf="features.column_navigation">
        <span class="text-[11px] text-slate-500">Cols</span>
        <button type="button" class="tb-icon"
          [disabled]="colPage === 0"
          [class.opacity-30]="colPage === 0"
          title="Previous columns"
          (click)="colPage > 0 && colPageChange.emit(colPage - 1)">‹</button>
        <span class="min-w-[90px] text-center text-[11px] font-medium text-slate-600">
          {{ colRangeLabel }}
        </span>
        <button type="button" class="tb-icon"
          [disabled]="colPage >= colTotalPages - 1"
          [class.opacity-30]="colPage >= colTotalPages - 1"
          title="Next columns"
          (click)="colPage < colTotalPages - 1 && colPageChange.emit(colPage + 1)">›</button>
      </ng-container>

      <!-- Divider -->
      <div class="mx-0.5 h-5 w-px bg-slate-200"></div>

      <!-- Fullscreen -->
      <button type="button" class="tb-icon"
        [class.active]="fullscreen"
        [title]="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        (click)="fullscreenChange.emit(!fullscreen)">⛶</button>

      <!-- Minimize / expand table body -->
      <button type="button" class="tb-icon"
        [title]="minimized ? 'Expand table' : 'Collapse table'"
        [class.active]="minimized"
        (click)="minimizedChange.emit(!minimized)">{{ minimized ? '▽' : '△' }}</button>

      <!-- View preset -->
      <ng-container *ngIf="features.save_view">
        <div class="relative" (click)="$event.stopPropagation()">
          <button type="button"
            class="inline-flex h-[30px] items-center gap-1.5 rounded-md border
                   border-slate-200 bg-white px-2.5 text-[11px] text-slate-600
                   transition-colors hover:bg-slate-50"
            (click)="toggle('view')">
            <span>☷</span>
            {{ activeView || 'Default' }}
            <span class="text-[9px]">⌄</span>
          </button>
          <div *ngIf="open === 'view'" class="drop right-0 top-full w-52">
            <div class="drop-label">Saved views</div>
            <button type="button" class="drop-item"
              (click)="viewChange.emit(''); close()">
              <span class="w-4" [class.text-blue-500]="!activeView">{{ !activeView ? '✓' : '' }}</span>
              Default
            </button>
            <button *ngFor="let v of savedViews" type="button" class="drop-item"
              (click)="viewChange.emit(v); close()">
              <span class="w-4" [class.text-blue-500]="activeView === v">{{ activeView === v ? '✓' : '' }}</span>
              {{ v }}
            </button>
            <div class="drop-sep"></div>
            <button type="button" class="drop-item text-[#436CF3]"
              (click)="saveViewClicked.emit(); close()">
              <span>＋</span> Save current view
            </button>
            <button *ngIf="features.reset_view" type="button" class="drop-item"
              (click)="resetViewClicked.emit(); close()">
              <span>↶</span> Reset view
            </button>
          </div>
        </div>
      </ng-container>

      <!-- Density -->
      <div class="relative" (click)="$event.stopPropagation()">
        <button type="button" class="tb-icon" title="Density"
          (click)="toggle('density')">≋</button>
        <div *ngIf="open === 'density'" class="drop right-0 top-full w-40">
          <div class="drop-label">Density</div>
          <button *ngFor="let d of densityOptions" type="button" class="drop-item"
            (click)="densityChange.emit(d.value); close()">
            <span class="w-4" [class.text-[#436CF3]]="density === d.value">
              {{ density === d.value ? '✓' : '' }}
            </span>
            {{ d.label }}
          </button>
        </div>
      </div>

      <!-- Columns panel -->
      <ng-container *ngIf="columnMgmt.enabled">
        <div class="relative" (click)="$event.stopPropagation()">
          <button type="button" class="tb-icon"
            [class.active]="open === 'columns'"
            [class.text-[#436CF3]]="hasHiddenColumns"
            title="Manage columns"
            (click)="toggle('columns')">▦</button>

          <!-- Columns panel popup -->
          <div *ngIf="open === 'columns'"
            class="drop right-0 top-full w-[300px] p-0">

            <div class="border-b border-slate-100 px-3 py-2.5">
              <p class="text-[11px] font-semibold text-[#0A173D]">Columns</p>
              <p class="text-[10px] text-slate-400">Manage visible columns</p>
            </div>

            <!-- Search -->
            <div class="border-b border-slate-100 px-2 py-2">
              <div class="relative">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">⌕</span>
                <input type="text"
                  class="h-8 w-full rounded-md border border-slate-200 pl-6 pr-2
                         text-[11px] outline-none focus:border-[#436CF3]"
                  placeholder="Search columns…"
                  [(ngModel)]="colSearch" />
              </div>
            </div>

            <!-- Column list -->
            <div class="max-h-60 overflow-y-auto px-1.5 py-1">
              <div *ngFor="let col of filteredColList" class="col-item">
                <span class="cursor-grab text-slate-300 select-none" *ngIf="columnMgmt.reorder">⠿</span>
                <label class="flex flex-1 cursor-pointer items-center gap-2">
                  <input type="checkbox"
                    class="h-3.5 w-3.5 rounded accent-[#436CF3]"
                    [checked]="col.visible"
                    (change)="toggleColumn(col.key)" />
                  <span class="text-[11px] text-slate-700">{{ col.label }}</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-100 px-3 py-2">
              <button type="button"
                class="text-[11px] font-medium text-slate-500 hover:text-[#436CF3]"
                (click)="resetColumnsClicked.emit(); close()">Reset</button>
              <div class="flex gap-1.5">
                <button type="button"
                  class="h-7 rounded-md border border-slate-200 bg-white px-3
                         text-[10px] font-medium text-slate-500"
                  (click)="close()">Cancel</button>
                <button type="button"
                  class="h-7 rounded-md bg-[#436CF3] px-3 text-[10px] font-medium text-white"
                  (click)="applyColumnsClicked.emit(columnVisibility); close()">Apply</button>
              </div>
            </div>

          </div>
        </div>
      </ng-container>

    </div>
  </div>
  `,
})
export class ToolbarActions {

  // ── Configuration flags ─────────────────────────────────────────────
  @Input() actions: ActionsConfig = {
    edit: true, delete: true, enable: true, disable: true, revert: true, more: true,
  };
  @Input() exportConfig: ExportConfig = { enabled: false, formats: [] };
  @Input() downloadConfig: DownloadConfig = { enabled: false, formats: [] };
  @Input() columnMgmt: ColumnManagementConfig = { enabled: true, reorder: true, show_hide: true };
  @Input() features: FeaturesConfig = {
    column_navigation: true, column_count_indicator: true, save_view: true, reset_view: true,
  };

  // ── State inputs ────────────────────────────────────────────────────
  @Input() selectionCount: number = 0;
  @Input() actionState: ActionBarState = {
    edit: 'disabled', delete: 'disabled', enable: 'disabled',
    disable: 'disabled', revert: 'disabled',
  };
  @Input() columns: ColumnDef[] = [];
  @Input() fullscreen: boolean = false;
  @Input() minimized: boolean = false;
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Input() activeView: string = '';
  @Input() savedViews: string[] = [];
  @Input() generateInfo: GenerateInfo = { generated: false };

  // Column navigation
  @Input() colPage: number = 0;
  @Input() colPageSize: number = 8;
  @Input() colTotalPages: number = 1;
  @Input() colRangeLabel: string = '1–8 of 8 columns';

  // ── Outputs ─────────────────────────────────────────────────────────
  @Output() actionClicked = new EventEmitter<ActionKey | string>();
  @Output() exportClicked = new EventEmitter<'excel' | 'csv'>();
  @Output() generateClicked = new EventEmitter<void>();
  @Output() downloadClicked = new EventEmitter<'excel' | 'csv'>();
  @Output() fullscreenChange = new EventEmitter<boolean>();
  @Output() minimizedChange  = new EventEmitter<boolean>();
  @Output() densityChange = new EventEmitter<'compact' | 'comfortable' | 'spacious'>();
  @Output() viewChange = new EventEmitter<string>();
  @Output() saveViewClicked = new EventEmitter<void>();
  @Output() resetViewClicked = new EventEmitter<void>();
  @Output() colPageChange = new EventEmitter<number>();
  @Output() columnVisibilityChange = new EventEmitter<Record<string, boolean>>();
  @Output() applyColumnsClicked = new EventEmitter<Record<string, boolean>>();
  @Output() resetColumnsClicked = new EventEmitter<void>();

  // ── Internal ─────────────────────────────────────────────────────────
  open: string | null = null;
  colSearch: string = '';
  columnVisibility: Record<string, boolean> = {};

  readonly densityOptions = [
    { value: 'compact' as const, label: 'Compact' },
    { value: 'comfortable' as const, label: 'Comfortable' },
    { value: 'spacious' as const, label: 'Spacious' },
  ];

  // ── Computed ─────────────────────────────────────────────────────────

  get editTooltip(): string {
    if (this.actionState.edit === 'disabled') {
      return this.selectionCount === 0
        ? 'Select a row to start editing'
        : 'Edit is not allowed for selected rows';
    }
    return 'Edit selected rows';
  }

  get generateTooltip(): string {
    if (this.generateInfo.generated && this.generateInfo.generatedAt) {
      return `Last generated: ${this.generateInfo.generatedAt}${this.generateInfo.generatedBy ? ' by ' + this.generateInfo.generatedBy : ''}`;
    }
    return 'Generate downloadable file';
  }

  get downloadTooltip(): string {
    if (this.generateInfo.generated && this.generateInfo.downloadedAt) {
      return `Last downloaded: ${this.generateInfo.downloadedAt}`;
    }
    return this.generateInfo.generated ? 'Download generated file' : 'Generate file to download first';
  }

  get hasHiddenColumns(): boolean {
    return this.columns.some(c => !c.visible);
  }

  get filteredColList(): ColumnDef[] {
    const q = this.colSearch.toLowerCase();
    return this.columns.filter(c => !q || c.label.toLowerCase().includes(q));
  }

  // ── Methods ──────────────────────────────────────────────────────────

  toggle(key: string): void {
    this.open = this.open === key ? null : key;
    if (this.open === 'columns') {
      this.columnVisibility = Object.fromEntries(this.columns.map(c => [c.key, c.visible]));
    }
  }

  close(): void { this.open = null; }

  emit(action: string): void { this.actionClicked.emit(action); this.close(); }

  toggleColumn(key: string): void {
    this.columnVisibility[key] = !this.columnVisibility[key];
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.open = null; }
}
