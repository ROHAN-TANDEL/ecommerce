import {
  Component, Input, Output, EventEmitter,
  HostListener, ChangeDetectionStrategy, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AutoRefreshComponent } from './auto-refresh';
import { LockUpdateComponent } from './lock-update';
import { RefreshStateService } from './refresh-state';
import type { ColumnDef } from '../models/column-def.model';
import type {
  ActionsConfig, ExportConfig, DownloadConfig,
  ColumnManagementConfig, FeaturesConfig,
} from '../models/table-config.model';

export type ActionKey =
  | 'edit' | 'save' | 'delete' | 'enable' | 'disable' | 'revert'
  | 'refresh' | 'lock_update' | 'copy' | 'reset';
export type ActionState = 'enabled' | 'disabled' | 'not_available';

export interface ActionBarState {
  edit: ActionState; save: ActionState; delete: ActionState;
  enable: ActionState; disable: ActionState; revert: ActionState;
}

export interface GenerateInfo {
  generated: boolean; generatedAt?: string; generatedBy?: string; downloadedAt?: string;
}

export interface ActionItem {
  key: string; label: string; icon: string;
  /** true → row opens a child submenu instead of firing the action */
  hasChildren?: boolean;
}

/**
 * ToolbarActions
 *
 * Renders:
 *   1. Toolbar strip  — [selection badge]  ············  [‹ col nav ›]
 *   2. Pinned panel   — shown when ≥1 action pinned, chips support drag-reorder
 *                       Chips with hasChildren open a downward submenu.
 *
 * The "Actions" button trigger is hosted by the PARENT (nexora-user.html,
 * tableHeaderAction slot) so it sits adjacent to Add User in the page header.
 * Parent passes [(actionsOpen)] to drive the dropdown panel rendered here.
 */
@Component({
  selector: 'dt-toolbar-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule, AutoRefreshComponent, LockUpdateComponent],
  providers: [RefreshStateService],
  styles: [`
    :host { display: block; }

    .tb-icon {
      @apply inline-flex h-[30px] w-[30px] items-center justify-center rounded-md
             border border-slate-200 bg-white text-[13px] text-slate-500 transition-colors;
    }
    .tb-icon:hover  { @apply bg-slate-50 text-[#436CF3]; }
    .tb-icon.active { @apply border-[#436CF3] text-[#436CF3]; }

    /* ── main dropdown (fixed, anchored by JS from trigger bounding rect) ── */
    .actions-drop {
      @apply fixed z-[200] w-64 rounded-xl
             border border-slate-200 bg-white p-1.5 shadow-2xl;
    }
    /* ── child submenu: opens LEFT of the dropdown row ─────────── */
    .child-drop {
      @apply absolute right-full top-0 mr-1 min-w-[210px] rounded-xl
             border border-slate-200 bg-white p-1.5 shadow-2xl z-[201];
    }

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

    .pin-btn {
      @apply shrink-0 cursor-pointer text-[11px] transition-colors;
    }

    /* ── pinned chips ────────────────────────────────────────────── */
    .pinned-chip {
      @apply relative inline-flex cursor-pointer items-center gap-1.5 select-none
             rounded-md px-2.5 py-1.5 text-[11px] font-medium
             bg-white border border-slate-200 transition-colors;
    }
    .pinned-chip.enabled  {
      @apply text-slate-600 hover:bg-blue-50 hover:text-[#436CF3] hover:border-slate-300;
    }
    .pinned-chip.disabled { @apply text-slate-400 cursor-not-allowed; }
    .pinned-chip.dragging  { @apply opacity-40; }
    .pinned-chip.drag-over { @apply border-[#436CF3] bg-blue-50; }

    /* child panel on a pinned chip — opens DOWNWARD */
    .pinned-child-drop {
      @apply absolute left-0 top-full z-[300] mt-1 min-w-[190px] rounded-xl
             border border-slate-200 bg-white p-1.5 shadow-2xl;
    }
  `],
  template: `
  <!-- ── dropdown anchor exposed to parent via #actionsAnchor ── -->
  <!-- Parent wraps its Actions button + this component in a relative div -->
  <div *ngIf="actionsOpen" class="actions-drop"
       [style.top.px]="dropTop" [style.right.px]="dropRight"
       (click)="$event.stopPropagation()">

    <ng-container *ngFor="let action of actionItems">
      <div class="relative group/row">

        <!-- row shell — always pointer-events-auto so pin toggle works even when disabled -->
        <div class="flex items-center rounded-md text-[11px] transition-colors hover:bg-blue-50"
             [class.opacity-50]="isRowDimmed(action.key)">

          <!-- pin toggle -->
          <button type="button" class="pin-btn px-2 py-[7px]"
            [class.text-[#436CF3]]="isPinned(action.key)"
            [class.text-slate-300]="!isPinned(action.key)"
            [title]="isPinned(action.key) ? 'Unpin' : 'Pin to toolbar'"
            (click)="togglePin(action.key, $event)">
            {{ isPinned(action.key) ? '📌' : '📍' }}
          </button>

          <!-- Refresh: embed live component -->
          <ng-container *ngIf="action.key === 'refresh'; else chkLock">
            <div class="flex flex-1 items-center overflow-hidden pr-1">
              <dt-auto-refresh [state]="refreshState"></dt-auto-refresh>
            </div>
          </ng-container>

          <!-- Lock: embed live component -->
          <ng-template #chkLock>
            <ng-container *ngIf="action.key === 'lock_update'; else normalRow">
              <div class="flex flex-1 items-center overflow-hidden pr-1">
                <dt-lock-update (lock)="actionClicked.emit('lock_update')"></dt-lock-update>
              </div>
            </ng-container>
          </ng-template>

          <!-- Normal row -->
          <ng-template #normalRow>
            <div class="flex flex-1 cursor-pointer items-center gap-2 px-1 py-[7px] pr-2.5
                        text-slate-700 group-hover/row:text-[#436CF3]"
                 [class.cursor-not-allowed]="!isActionEnabled(action.key)"
                 [title]="getActionTooltip(action.key)"
                 (click)="onRowClick(action, $event)">
              <span class="shrink-0 text-[13px]">{{ action.icon }}</span>
              <span class="flex-1">{{ action.label }}</span>
              <span *ngIf="action.hasChildren" class="ml-auto text-[9px] text-slate-400">‹</span>
            </div>
          </ng-template>
        </div>

        <!-- child submenu (LEFT) -->
        <div *ngIf="action.hasChildren && openChildMenu === action.key"
             class="child-drop" (click)="$event.stopPropagation()">
          <ng-container [ngSwitch]="action.key">

            <ng-container *ngSwitchCase="'export'">
              <div class="drop-label">Export format</div>
              <button *ngFor="let fmt of exportConfig.formats" type="button" class="drop-item"
                (click)="exportClicked.emit(fmt)">
                <span class="w-6 text-center font-bold">{{ fmt === 'excel' ? 'X' : 'CSV' }}</span>
                <span class="flex-1">{{ fmt === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)' }}</span>
                <span *ngIf="fmt === 'excel'" class="text-[10px] text-slate-400">max 10k</span>
              </button>
            </ng-container>

            <ng-container *ngSwitchCase="'download'">
              <div class="drop-label">Download format</div>
              <button *ngFor="let fmt of downloadConfig.formats" type="button" class="drop-item"
                (click)="downloadClicked.emit(fmt)">
                <span class="w-6 text-center font-bold">{{ fmt === 'excel' ? 'X' : 'CSV' }}</span>
                {{ fmt === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)' }}
              </button>
            </ng-container>

            <ng-container *ngSwitchCase="'view'">
              <div class="drop-label">Saved views</div>
              <button type="button" class="drop-item" (click)="viewChange.emit('')">
                <span class="w-4" [class.text-blue-500]="!activeView">{{ !activeView ? '✓' : '' }}</span>
                Default
              </button>
              <button *ngFor="let v of savedViews" type="button" class="drop-item"
                (click)="viewChange.emit(v)">
                <span class="w-4" [class.text-blue-500]="activeView === v">{{ activeView === v ? '✓' : '' }}</span>
                {{ v }}
              </button>
              <div class="drop-sep"></div>
              <button type="button" class="drop-item text-[#436CF3]" (click)="saveViewClicked.emit()">
                <span>＋</span> Save current view
              </button>
              <button *ngIf="features.reset_view" type="button" class="drop-item"
                (click)="resetViewClicked.emit()">↶ Reset view</button>
            </ng-container>

            <ng-container *ngSwitchCase="'density'">
              <div class="drop-label">Density</div>
              <button *ngFor="let d of densityOptions" type="button" class="drop-item"
                (click)="densityChange.emit(d.value)">
                <span class="w-4" [class.text-[#436CF3]]="density === d.value">
                  {{ density === d.value ? '✓' : '' }}
                </span>
                {{ d.label }}
              </button>
            </ng-container>

            <ng-container *ngSwitchCase="'columns'">
              <div class="border-b border-slate-100 px-3 py-2">
                <p class="text-[11px] font-semibold text-[#0A173D]">Columns</p>
                <p class="text-[10px] text-slate-400">Show / hide columns</p>
              </div>
              <div class="border-b border-slate-100 px-2 py-2">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">⌕</span>
                  <input type="text"
                    class="h-8 w-full rounded-md border border-slate-200 pl-6 pr-2
                           text-[11px] outline-none focus:border-[#436CF3]"
                    placeholder="Search columns…"
                    [(ngModel)]="colSearch" (click)="$event.stopPropagation()" />
                </div>
              </div>
              <div class="max-h-52 overflow-y-auto px-1.5 py-1">
                <div *ngFor="let col of filteredColList" class="col-item">
                  <span *ngIf="columnMgmt.reorder" class="cursor-grab text-slate-300 select-none">⠿</span>
                  <label class="flex flex-1 cursor-pointer items-center gap-2">
                    <input type="checkbox" class="h-3.5 w-3.5 rounded accent-[#436CF3]"
                      [checked]="columnVisibility[col.key] ?? col.visible"
                      (change)="toggleColumn(col.key)" />
                    <span class="text-[11px] text-slate-700">{{ col.label }}</span>
                  </label>
                </div>
              </div>
              <div class="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                <button type="button"
                  class="text-[11px] font-medium text-slate-500 hover:text-[#436CF3]"
                  (click)="resetColumnsClicked.emit()">Reset</button>
                <div class="flex gap-1.5">
                  <button type="button"
                    class="h-7 rounded-md border border-slate-200 bg-white px-3
                           text-[10px] font-medium text-slate-500"
                    (click)="closeChildMenu()">Cancel</button>
                  <button type="button"
                    class="h-7 rounded-md bg-[#436CF3] px-3 text-[10px] font-medium text-white"
                    (click)="applyColumnsClicked.emit(columnVisibility); closeChildMenu()">Apply</button>
                </div>
              </div>
            </ng-container>

          </ng-container>
        </div>

      </div>
    </ng-container>

    <!-- Column navigation (bottom of dropdown, no pin) -->
    <ng-container *ngIf="features.column_navigation">
      <div class="drop-sep"></div>
      <div class="flex items-center justify-between px-2 py-1.5">
        <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Columns</span>
        <div class="flex items-center gap-1">
          <button type="button" class="tb-icon"
            [disabled]="!canScrollPrevious" [class.opacity-30]="!canScrollPrevious"
            title="Previous columns"
            (click)="$event.stopPropagation(); canScrollPrevious && columnNavigate.emit('previous')">‹</button>
          <span class="min-w-[56px] text-center text-[11px] font-medium text-slate-600">
            {{ columnScrollLabel }}
          </span>
          <button type="button" class="tb-icon"
            [disabled]="!canScrollNext" [class.opacity-30]="!canScrollNext"
            title="Next columns"
            (click)="$event.stopPropagation(); canScrollNext && columnNavigate.emit('next')">›</button>
        </div>
      </div>
    </ng-container>
  </div><!-- /actions-drop -->


  <!-- ══ TOOLBAR STRIP ═════════════════════════════════════════════ -->
  <div class="flex min-h-[46px] flex-wrap items-center gap-2
              bg-gradient-to-r from-blue-50/60 to-white px-3 py-1.5">

    <!-- selection badge -->
    <div *ngIf="selectionCount > 0"
         class="flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-0.5">
      <span class="text-[11px] font-semibold text-[#436CF3]">{{ selectionCount }}</span>
      <span class="text-[11px] text-slate-500">selected</span>
    </div>

  </div><!-- /toolbar strip -->


  <!-- ══ PINNED ACTIONS PANEL ══════════════════════════════════════ -->
  <div *ngIf="pinnedActions.length > 0"
       class="flex flex-wrap items-center gap-1.5 border-t border-slate-200
              bg-gradient-to-r from-blue-50/40 to-white px-3 py-1.5 min-h-[44px]">

    <span class="mr-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pinned</span>

    <ng-container *ngFor="let action of pinnedActions; let i = index">

      <!-- Refresh chip -->
      <div *ngIf="action.key === 'refresh'"
           class="pinned-chip enabled"
           [class.dragging]="dragIndex === i" [class.drag-over]="dropIndex === i"
           draggable="true"
           (dragstart)="onDragStart(i,$event)" (dragover)="onDragOver(i,$event)"
           (drop)="onDrop(i,$event)" (dragend)="onDragEnd()">
        <dt-auto-refresh [state]="refreshState"></dt-auto-refresh>
      </div>

      <!-- Lock chip -->
      <div *ngIf="action.key === 'lock_update'"
           class="pinned-chip enabled"
           [class.dragging]="dragIndex === i" [class.drag-over]="dropIndex === i"
           draggable="true"
           (dragstart)="onDragStart(i,$event)" (dragover)="onDragOver(i,$event)"
           (drop)="onDrop(i,$event)" (dragend)="onDragEnd()">
        <dt-lock-update (lock)="actionClicked.emit('lock_update')"></dt-lock-update>
      </div>

      <!-- Child-menu chip (export / download / view / density / columns) -->
      <div *ngIf="action.key !== 'refresh' && action.key !== 'lock_update' && action.hasChildren"
           class="pinned-chip"
           [class.enabled]="isActionEnabled(action.key)"
           [class.disabled]="!isActionEnabled(action.key)"
           [class.dragging]="dragIndex === i" [class.drag-over]="dropIndex === i"
           draggable="true"
           (dragstart)="onDragStart(i,$event)" (dragover)="onDragOver(i,$event)"
           (drop)="onDrop(i,$event)" (dragend)="onDragEnd()"
           (click)="$event.stopPropagation(); isActionEnabled(action.key) && togglePinnedChild(action.key)">
        <span class="text-[13px]">{{ action.icon }}</span>
        <span>{{ action.label }}</span>
        <span class="ml-0.5 text-[9px] text-slate-400">⌄</span>

        <!-- child panel opens DOWNWARD below the chip -->
        <div *ngIf="openPinnedChild === action.key"
             class="pinned-child-drop" (click)="$event.stopPropagation()">
          <ng-container [ngSwitch]="action.key">

            <ng-container *ngSwitchCase="'export'">
              <div class="drop-label">Export format</div>
              <button *ngFor="let fmt of exportConfig.formats" type="button" class="drop-item"
                (click)="exportClicked.emit(fmt); openPinnedChild = null">
                <span class="w-6 text-center font-bold">{{ fmt === 'excel' ? 'X' : 'CSV' }}</span>
                <span class="flex-1">{{ fmt === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)' }}</span>
              </button>
            </ng-container>

            <ng-container *ngSwitchCase="'download'">
              <div class="drop-label">Download format</div>
              <button *ngFor="let fmt of downloadConfig.formats" type="button" class="drop-item"
                (click)="downloadClicked.emit(fmt); openPinnedChild = null">
                <span class="w-6 text-center font-bold">{{ fmt === 'excel' ? 'X' : 'CSV' }}</span>
                {{ fmt === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)' }}
              </button>
            </ng-container>

            <ng-container *ngSwitchCase="'view'">
              <div class="drop-label">Saved views</div>
              <button type="button" class="drop-item" (click)="viewChange.emit(''); openPinnedChild = null">
                <span class="w-4" [class.text-blue-500]="!activeView">{{ !activeView ? '✓' : '' }}</span>
                Default
              </button>
              <button *ngFor="let v of savedViews" type="button" class="drop-item"
                (click)="viewChange.emit(v); openPinnedChild = null">
                <span class="w-4" [class.text-blue-500]="activeView === v">{{ activeView === v ? '✓' : '' }}</span>
                {{ v }}
              </button>
              <div class="drop-sep"></div>
              <button type="button" class="drop-item text-[#436CF3]"
                (click)="saveViewClicked.emit(); openPinnedChild = null">＋ Save view</button>
              <button *ngIf="features.reset_view" type="button" class="drop-item"
                (click)="resetViewClicked.emit(); openPinnedChild = null">↶ Reset view</button>
            </ng-container>

            <ng-container *ngSwitchCase="'density'">
              <div class="drop-label">Density</div>
              <button *ngFor="let d of densityOptions" type="button" class="drop-item"
                (click)="densityChange.emit(d.value); openPinnedChild = null">
                <span class="w-4" [class.text-[#436CF3]]="density === d.value">
                  {{ density === d.value ? '✓' : '' }}
                </span>
                {{ d.label }}
              </button>
            </ng-container>

            <ng-container *ngSwitchCase="'columns'">
              <div class="border-b border-slate-100 px-3 py-2">
                <p class="text-[11px] font-semibold text-[#0A173D]">Columns</p>
              </div>
              <div class="border-b border-slate-100 px-2 py-1.5">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">⌕</span>
                  <input type="text"
                    class="h-7 w-full rounded-md border border-slate-200 pl-6 pr-2
                           text-[11px] outline-none focus:border-[#436CF3]"
                    placeholder="Search…"
                    [(ngModel)]="colSearch" (click)="$event.stopPropagation()" />
                </div>
              </div>
              <div class="max-h-44 overflow-y-auto px-1.5 py-1">
                <div *ngFor="let col of filteredColList" class="col-item">
                  <label class="flex flex-1 cursor-pointer items-center gap-2">
                    <input type="checkbox" class="h-3.5 w-3.5 rounded accent-[#436CF3]"
                      [checked]="columnVisibility[col.key] ?? col.visible"
                      (change)="toggleColumn(col.key)" />
                    <span class="text-[11px] text-slate-700">{{ col.label }}</span>
                  </label>
                </div>
              </div>
              <div class="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                <button type="button"
                  class="text-[11px] font-medium text-slate-500 hover:text-[#436CF3]"
                  (click)="resetColumnsClicked.emit()">Reset</button>
                <button type="button"
                  class="h-7 rounded-md bg-[#436CF3] px-3 text-[10px] font-medium text-white"
                  (click)="applyColumnsClicked.emit(columnVisibility); openPinnedChild = null">Apply</button>
              </div>
            </ng-container>

          </ng-container>
        </div><!-- /pinned-child-drop -->
      </div><!-- /child-menu chip -->

      <!-- Plain action chip (no children) -->
      <div *ngIf="action.key !== 'refresh' && action.key !== 'lock_update' && !action.hasChildren"
           class="pinned-chip"
           [class.enabled]="isActionEnabled(action.key)"
           [class.disabled]="!isActionEnabled(action.key)"
           [class.dragging]="dragIndex === i" [class.drag-over]="dropIndex === i"
           [title]="getActionTooltip(action.key)"
           draggable="true"
           (dragstart)="onDragStart(i,$event)" (dragover)="onDragOver(i,$event)"
           (drop)="onDrop(i,$event)" (dragend)="onDragEnd()"
           (click)="isActionEnabled(action.key) && firePinnedAction(action)">
        <span class="text-[13px]">{{ action.icon }}</span>
        <span>{{ action.label }}</span>
      </div>

    </ng-container>
  </div><!-- /pinned panel -->
  `,
})
export class ToolbarActions implements OnDestroy {

  // ── Config inputs ─────────────────────────────────────────────────
  @Input() actions: ActionsConfig = {
    edit: true, delete: true, enable: true, disable: true, revert: true, more: true,
  };
  @Input() exportConfig: ExportConfig       = { enabled: false, formats: [] };
  @Input() downloadConfig: DownloadConfig   = { enabled: false, formats: [] };
  @Input() columnMgmt: ColumnManagementConfig = { enabled: true, reorder: true, show_hide: true };
  @Input() features: FeaturesConfig = {
    column_navigation: true, column_count_indicator: true, save_view: true, reset_view: true,
  };

  // ── State inputs ──────────────────────────────────────────────────
  @Input() selectionCount = 0;
  @Input() actionState: ActionBarState = {
    edit: 'disabled', save: 'disabled', delete: 'disabled',
    enable: 'disabled', disable: 'disabled', revert: 'disabled',
  };
  @Input() columns: ColumnDef[]  = [];
  @Input() fullscreen  = false;
  @Input() minimized   = false;
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Input() activeView  = '';
  @Input() savedViews: string[] = [];
  @Input() generateInfo: GenerateInfo = { generated: false };
  @Input() canScrollPrevious = false;
  @Input() canScrollNext     = false;
  @Input() columnScrollLabel = 'Columns';
  /** Two-way: parent owns the open/close toggle for the Actions button */
  @Input() actionsOpen = false;
  @Output() actionsOpenChange = new EventEmitter<boolean>();
  /** Fixed-position coordinates computed from the trigger button's bounding rect */
  @Input() dropTop   = 0;
  @Input() dropRight = 0;

  // ── Outputs ───────────────────────────────────────────────────────
  @Output() actionClicked          = new EventEmitter<ActionKey | string>();
  @Output() exportClicked          = new EventEmitter<'excel' | 'csv'>();
  @Output() downloadClicked        = new EventEmitter<'excel' | 'csv'>();
  @Output() fullscreenChange       = new EventEmitter<boolean>();
  @Output() minimizedChange        = new EventEmitter<boolean>();
  @Output() densityChange          = new EventEmitter<'compact' | 'comfortable' | 'spacious'>();
  @Output() viewChange             = new EventEmitter<string>();
  @Output() saveViewClicked        = new EventEmitter<void>();
  @Output() resetViewClicked       = new EventEmitter<void>();
  @Output() columnNavigate         = new EventEmitter<'previous' | 'next'>();
  @Output() columnVisibilityChange = new EventEmitter<Record<string, boolean>>();
  @Output() applyColumnsClicked    = new EventEmitter<Record<string, boolean>>();
  @Output() resetColumnsClicked    = new EventEmitter<void>();
  @Output() pinnedActionsChange    = new EventEmitter<ActionItem[]>();

  // ── Internal ──────────────────────────────────────────────────────
  openChildMenu: string | null   = null;
  openPinnedChild: string | null = null;
  colSearch = '';
  columnVisibility: Record<string, boolean> = {};
  private _pinnedKeys: string[] = [];
  dragIndex = -1;
  dropIndex = -1;

  private readonly _refreshSub: Subscription;

  constructor(readonly refreshState: RefreshStateService) {
    this._refreshSub = this.refreshState.refreshRequested
      .subscribe(() => this.actionClicked.emit('refresh'));
  }

  ngOnDestroy(): void { this._refreshSub.unsubscribe(); }

  readonly densityOptions = [
    { value: 'compact'     as const, label: 'Compact'     },
    { value: 'comfortable' as const, label: 'Comfortable' },
    { value: 'spacious'    as const, label: 'Spacious'    },
  ];

  readonly actionItems: ActionItem[] = [
    { key: 'refresh',    label: 'Refresh',    icon: '⟳'  },
    { key: 'lock_update',label: 'Lock',       icon: '🔒' },
    { key: 'edit',       label: 'Edit',       icon: '✎'  },
    { key: 'save',       label: 'Save',       icon: '✓'  },
    { key: 'delete',     label: 'Delete',     icon: '🗑' },
    { key: 'enable',     label: 'Enable',     icon: '✅' },
    { key: 'disable',    label: 'Disable',    icon: '⊘'  },
    { key: 'revert',     label: 'Revert',     icon: '↶'  },
    { key: 'expand',     label: 'Expand',     icon: '△'  },
    { key: 'copy',       label: 'Copy',       icon: '⎘'  },
    { key: 'reset',      label: 'Reset',      icon: '↺'  },
    { key: 'export',     label: 'Export',     icon: '⇪', hasChildren: true },
    { key: 'download',   label: 'Download',   icon: '⇩', hasChildren: true },
    { key: 'fullscreen', label: 'Fullscreen', icon: '⛶'  },
    { key: 'collapse',   label: 'Collapse',   icon: '▽'  },
    { key: 'view',       label: 'View',       icon: '☷', hasChildren: true },
    { key: 'density',    label: 'Density',    icon: '≋', hasChildren: true },
    { key: 'columns',    label: 'Columns',    icon: '▦', hasChildren: true },
  ];

  // ── Derived ───────────────────────────────────────────────────────

  get pinnedActions(): ActionItem[] {
    return this._pinnedKeys
      .map(k => this.actionItems.find(a => a.key === k))
      .filter((a): a is ActionItem => !!a);
  }

  get filteredColList(): ColumnDef[] {
    const q = this.colSearch.toLowerCase();
    return this.columns.filter(c => !q || c.label.toLowerCase().includes(q));
  }

  // ── Helpers ───────────────────────────────────────────────────────

  isPinned(key: string): boolean { return this._pinnedKeys.includes(key); }

  /** Only dim non-interactive rows (not refresh/lock which host live components) */
  isRowDimmed(key: string): boolean {
    return key !== 'refresh' && key !== 'lock_update' && !this.isActionEnabled(key);
  }

  isActionEnabled(key: string): boolean {
    switch (key) {
      case 'edit':       return this.actionState.edit    === 'enabled';
      case 'save':       return this.actionState.save    === 'enabled';
      case 'delete':     return this.actionState.delete  === 'enabled';
      case 'enable':     return this.actionState.enable  === 'enabled';
      case 'disable':    return this.actionState.disable === 'enabled';
      case 'revert':     return this.actionState.revert  === 'enabled';
      case 'copy':       return this.selectionCount > 0;
      case 'refresh':    case 'lock_update': case 'reset': return true;
      case 'export':     return this.exportConfig.enabled;
      case 'download':   return this.downloadConfig.enabled;
      case 'columns':    return this.columnMgmt.enabled;
      case 'view':       return this.features.save_view;
      default:           return true;
    }
  }

  getActionTooltip(key: string): string {
    switch (key) {
      case 'edit':    return this.actionState.edit === 'disabled'
        ? (this.selectionCount === 0 ? 'Select a row to edit' : 'Edit not allowed') : 'Edit selected';
      case 'save':    return this.actionState.save === 'enabled' ? 'Save changes' : 'No pending changes';
      case 'delete':  return this.actionState.delete  === 'disabled' ? 'Select rows to delete'  : 'Delete selected';
      case 'enable':  return this.actionState.enable  === 'disabled' ? 'Select rows to enable'  : 'Enable selected';
      case 'disable': return this.actionState.disable === 'disabled' ? 'Select rows to disable' : 'Disable selected';
      case 'revert':  return this.actionState.revert  === 'disabled' ? 'No changes to revert'   : 'Revert changes';
      case 'copy':    return this.selectionCount === 0 ? 'Select rows to copy' : 'Duplicate selected rows';
      case 'reset':   return 'Reset table to original server values';
      case 'fullscreen': return this.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
      case 'collapse':   return this.minimized   ? 'Expand table'   : 'Collapse table';
      default:        return '';
    }
  }

  togglePin(key: string, event: MouseEvent): void {
    event.stopPropagation();
    this._pinnedKeys = this.isPinned(key)
      ? this._pinnedKeys.filter(k => k !== key)
      : [...this._pinnedKeys, key];
    this.pinnedActionsChange.emit(this.pinnedActions);
  }

  onRowClick(action: ActionItem, event: MouseEvent): void {
    event.stopPropagation();
    if (action.hasChildren) {
      this.openChildMenu = this.openChildMenu === action.key ? null : action.key;
      if (this.openChildMenu === 'columns') {
        this.columnVisibility = Object.fromEntries(this.columns.map(c => [c.key, c.visible]));
      }
      return;
    }
    if (!this.isActionEnabled(action.key)) return;
    this.dispatchAction(action.key);
    this.actionsOpen = false;
    this.actionsOpenChange.emit(false);
    this.openChildMenu = null;
  }

  firePinnedAction(action: ActionItem): void {
    if (!this.isActionEnabled(action.key)) return;
    this.dispatchAction(action.key);
  }

  togglePinnedChild(key: string): void {
    this.openPinnedChild = this.openPinnedChild === key ? null : key;
    if (this.openPinnedChild === 'columns') {
      this.columnVisibility = Object.fromEntries(this.columns.map(c => [c.key, c.visible]));
    }
  }

  closeChildMenu(): void { this.openChildMenu = null; }

  toggleColumn(key: string): void {
    this.columnVisibility[key] = !(this.columnVisibility[key] ?? true);
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────

  onDragStart(index: number, event: DragEvent): void {
    this.dragIndex = index;
    event.dataTransfer?.setData('text/plain', String(index));
  }

  onDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    this.dropIndex = index;
  }

  onDrop(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.dragIndex < 0 || this.dragIndex === index) {
      this.dragIndex = -1; this.dropIndex = -1; return;
    }
    const arr = [...this._pinnedKeys];
    const [moved] = arr.splice(this.dragIndex, 1);
    arr.splice(index, 0, moved);
    this._pinnedKeys = arr;
    this.dragIndex = -1; this.dropIndex = -1;
    this.pinnedActionsChange.emit(this.pinnedActions);
  }

  onDragEnd(): void { this.dragIndex = -1; this.dropIndex = -1; }

  // ── Internal ──────────────────────────────────────────────────────

  private dispatchAction(key: string): void {
    switch (key) {
      case 'fullscreen': this.fullscreenChange.emit(!this.fullscreen); break;
      case 'collapse':   this.minimizedChange.emit(!this.minimized);   break;
      default:           this.actionClicked.emit(key);
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.actionsOpen) {
      this.actionsOpen = false;
      this.actionsOpenChange.emit(false);
      this.openChildMenu = null;
    }
    if (this.openPinnedChild) { this.openPinnedChild = null; }
  }
}
