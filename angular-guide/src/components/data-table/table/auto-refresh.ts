import {
  Component, Input, Output, EventEmitter, ChangeDetectorRef,
  ChangeDetectionStrategy, HostListener, ElementRef, OnInit, OnDestroy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RefreshStateService, RefreshInterval } from './refresh-state';

/**
 * AutoRefreshComponent — isolated auto-refresh widget.
 *
 * Can be used standalone anywhere (e.g. `<dt-auto-refresh (refresh)="onRefresh()"></dt-auto-refresh>`)
 * or linked with a table's shared RefreshStateService via `[state]="myState"`.
 *
 * [compact]=true  (default) → standalone chip/button with ⌄ dropdown below it
 * [compact]=false           → full row with ‹ flyout menu for inside an action dropdown
 */
@Component({
  selector: 'dt-auto-refresh',
  standalone: true,
  imports: [CommonModule],
  providers: [RefreshStateService],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: inline-block; }'],
  template: `
  <!-- ══ COMPACT CHIP / STANDALONE BUTTON ════════════════════════ -->
  <ng-container *ngIf="compact; else fullRow">

    <div class="relative inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors"
         (click)="$event.stopPropagation()">

      <button type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 rounded-l-lg transition-colors"
        (click)="triggerRefresh()" title="Refresh now">
        <span [class.animate-spin]="activeState.isRefreshing" class="text-[13px]">⟳</span>
        <span *ngIf="activeState.activeInterval !== 'live'" class="tabular-nums font-semibold">{{ activeState.countdown }}s</span>
        <span *ngIf="activeState.activeInterval === 'live'" class="text-[#436CF3] font-semibold">Live</span>
      </button>

      <div class="h-4 w-[1px] bg-slate-200"></div>

      <button type="button"
        class="inline-flex h-full items-center px-2 py-1.5 text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-r-lg transition-colors"
        (click)="toggleCompactMenu($event)" title="Change refresh interval">
        <span class="text-[9px]">⌄</span>
      </button>

      <!-- Anchored relative directly below the button -->
      <div *ngIf="isMenuOpen"
           class="absolute left-0 top-full mt-1.5 z-[500] min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
           (click)="$event.stopPropagation()">
        <ng-container *ngTemplateOutlet="picker"></ng-container>
      </div>

    </div>

  </ng-container>

  <!-- ══ FULL ROW (inside Actions dropdown) ══════════════════════ -->
  <ng-template #fullRow>

    <div class="relative flex w-full items-center gap-0"
         (click)="$event.stopPropagation()">

      <button type="button"
        class="inline-flex h-[34px] flex-1 items-center gap-1.5 rounded-md px-2
               text-[11px] font-medium text-slate-600 hover:bg-blue-50 hover:text-[#436CF3] transition-colors"
        (click)="triggerRefresh()" title="Refresh now">
        <span [class.animate-spin]="activeState.isRefreshing" class="text-[13px]">⟳</span>
        <span class="flex-1 text-left">Refresh</span>
        <span *ngIf="activeState.activeInterval !== 'live'" class="tabular-nums text-[10px] text-slate-400">
          {{ activeState.countdown }}s
        </span>
        <span *ngIf="activeState.activeInterval === 'live'" class="text-[10px] text-[#436CF3]">Live</span>
      </button>

      <!-- ‹ opens picker to the left -->
      <button type="button"
        class="inline-flex h-[34px] w-7 shrink-0 items-center justify-center rounded-md
               text-[9px] text-slate-500 hover:bg-blue-50 hover:text-[#436CF3] transition-colors"
        (click)="toggleInlinePicker($event)" title="Change interval">‹</button>

      <!-- picker: absolute right-full = opens LEFT -->
      <div *ngIf="isMenuOpen"
           class="absolute right-full top-0 z-[500] mr-1 min-w-[170px] rounded-xl
                  border border-slate-200 bg-white p-1.5 shadow-2xl"
           (click)="$event.stopPropagation()">
        <ng-container *ngTemplateOutlet="picker"></ng-container>
      </div>

    </div>

  </ng-template>

  <!-- ══ SHARED PICKER CONTENT ══════════════════════════════════ -->
  <ng-template #picker>
    <div class="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      Refresh interval
    </div>
    <ng-container *ngFor="let opt of intervalOptions">
      <div *ngIf="opt.sep" class="my-1 border-t border-slate-100"></div>
      <button *ngIf="!opt.sep" type="button"
        class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
               text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
        (click)="setInterval(opt.value!)">
        <span class="w-4" [class.text-[#436CF3]]="activeState.activeInterval === opt.value">
          {{ activeState.activeInterval === opt.value ? '✓' : '' }}
        </span>{{ opt.label }}
      </button>
    </ng-container>
  </ng-template>
  `,
})
export class AutoRefreshComponent implements OnInit, OnDestroy {
  /** Optional external state (e.g. from table). If not supplied, an internal instance is used. */
  @Input() state?: RefreshStateService;
  /** When true, renders as a standalone chip/button. When false, renders as a dropdown row. */
  @Input() compact = true;

  @Output() refresh = new EventEmitter<void>();
  @Output() intervalChange = new EventEmitter<RefreshInterval>();

  private readonly localState = inject(RefreshStateService);
  private refreshSub?: Subscription;

  isMenuOpen = false;

  get activeState(): RefreshStateService {
    return this.state ?? this.localState;
  }

  readonly intervalOptions: Array<{ value?: RefreshInterval; label?: string; sep?: boolean }> = [
    { value: '5s',   label: '5 sec'  },
    { value: '15s',  label: '15 sec' },
    { value: '1m',   label: '1 min'  },
    { value: '5m',   label: '5 min'  },
    { sep: true },
    { value: 'live', label: 'Live'   },
  ];

  constructor(
    private readonly elRef: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.refreshSub = this.activeState.refreshRequested.subscribe(() => {
      this.refresh.emit();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  triggerRefresh(): void {
    this.activeState.requestRefresh();
    this.cdr.markForCheck();
  }

  toggleCompactMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.markForCheck();
  }

  toggleInlinePicker(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.markForCheck();
  }

  setInterval(interval: RefreshInterval): void {
    this.activeState.setInterval(interval);
    this.intervalChange.emit(interval);
    this.isMenuOpen = false;
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMenuOpen && !this.elRef.nativeElement.contains(event.target as Node)) {
      this.isMenuOpen = false;
      this.cdr.markForCheck();
    }
  }
}
