import {
  Component, Input, Output, EventEmitter, ChangeDetectorRef,
  ChangeDetectionStrategy, HostListener, ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefreshStateService, RefreshInterval } from './refresh-state';

/**
 * AutoRefreshComponent — purely presentational, timer state in RefreshStateService.
 *
 * [compact]=false  → full dropdown row, interval picker opens to the LEFT
 * [compact]=true   → pinned-panel chip, interval picker opens fixed below the ⌄ button
 */
@Component({
  selector: 'dt-auto-refresh',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: contents; }'],
  template: `
  <!-- ══ COMPACT CHIP (pinned panel) ════════════════════════════ -->
  <ng-container *ngIf="compact; else fullRow">

    <div class="relative inline-flex items-center gap-0.5"
         (click)="$event.stopPropagation()">

      <button type="button"
        class="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px]
               font-medium text-slate-600 hover:bg-blue-50 hover:text-[#436CF3] transition-colors"
        (click)="triggerRefresh()" title="Refresh now">
        <span [class.animate-spin]="state.isRefreshing">⟳</span>
        <span *ngIf="state.activeInterval !== 'live'" class="tabular-nums">{{ state.countdown }}s</span>
        <span *ngIf="state.activeInterval === 'live'" class="text-[#436CF3]">Live</span>
      </button>

      <button type="button" #compactToggle
        class="inline-flex h-[24px] w-5 items-center justify-center rounded-md text-[9px]
               text-slate-500 hover:bg-blue-50 hover:text-[#436CF3] transition-colors"
        (click)="openCompactMenu($event, compactToggle)" title="Change interval">⌄</button>

      <!-- fixed-position picker so it escapes any overflow clip -->
      <div *ngIf="isMenuOpen"
           class="fixed z-[500] min-w-[160px] rounded-xl border border-slate-200 bg-white
                  p-1.5 shadow-2xl"
           [style.top.px]="menuTop" [style.left.px]="menuLeft"
           (click)="$event.stopPropagation()">
        <ng-container *ngTemplateOutlet="picker"></ng-container>
      </div>

    </div>

  </ng-container>

  <!-- ══ FULL ROW (inside Actions dropdown) ══════════════════════ -->
  <ng-template #fullRow>

    <!-- This wrapper must be position:relative so the picker anchors correctly -->
    <div class="relative flex w-full items-center gap-0"
         (click)="$event.stopPropagation()">

      <button type="button"
        class="inline-flex h-[34px] flex-1 items-center gap-1.5 rounded-md px-2
               text-[11px] font-medium text-slate-600 hover:bg-blue-50 hover:text-[#436CF3] transition-colors"
        (click)="triggerRefresh()" title="Refresh now">
        <span [class.animate-spin]="state.isRefreshing">⟳</span>
        <span class="flex-1 text-left">Refresh</span>
        <span *ngIf="state.activeInterval !== 'live'" class="tabular-nums text-[10px] text-slate-400">
          {{ state.countdown }}s
        </span>
        <span *ngIf="state.activeInterval === 'live'" class="text-[10px] text-[#436CF3]">Live</span>
      </button>

      <!-- ‹ opens the picker to the LEFT, matches Export/Density pattern -->
      <button type="button"
        class="inline-flex h-[34px] w-7 shrink-0 items-center justify-center rounded-md
               text-[9px] text-slate-500 hover:bg-blue-50 hover:text-[#436CF3] transition-colors"
        (click)="toggleInlinePicker($event)" title="Change interval">‹</button>

      <!-- picker: absolute right-full = opens LEFT of this wrapper -->
      <div *ngIf="isMenuOpen"
           class="absolute right-full top-0 z-[500] mr-1 min-w-[160px] rounded-xl
                  border border-slate-200 bg-white p-1.5 shadow-2xl"
           (click)="$event.stopPropagation()">
        <ng-container *ngTemplateOutlet="picker"></ng-container>
      </div>

    </div>

  </ng-template>

  <!-- ══ SHARED PICKER CONTENT ══════════════════════════════════ -->
  <ng-template #picker>
    <div class="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      Interval
    </div>
    <ng-container *ngFor="let opt of intervalOptions">
      <div *ngIf="opt.sep" class="my-1 border-t border-slate-100"></div>
      <button *ngIf="!opt.sep" type="button"
        class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left
               text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
        (click)="setInterval(opt.value!)">
        <span class="w-4" [class.text-[#436CF3]]="state.activeInterval === opt.value">
          {{ state.activeInterval === opt.value ? '✓' : '' }}
        </span>{{ opt.label }}
      </button>
    </ng-container>
  </ng-template>
  `,
})
export class AutoRefreshComponent {
  @Input() state!: RefreshStateService;
  @Input() compact = false;
  @Output() refresh = new EventEmitter<void>();   // kept for compat

  isMenuOpen = false;
  menuTop    = 0;
  menuLeft   = 0;

  readonly intervalOptions: Array<{ value?: RefreshInterval; label?: string; sep?: boolean }> = [
    { value: '5s',   label: '5 sec'  },
    { sep: true },
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

  triggerRefresh(): void {
    this.state.requestRefresh();
    this.cdr.markForCheck();
  }

  openCompactMenu(event: MouseEvent, btn: HTMLElement): void {
    event.stopPropagation();
    if (this.isMenuOpen) { this.isMenuOpen = false; this.cdr.markForCheck(); return; }
    const rect    = btn.getBoundingClientRect();
    this.menuTop  = rect.bottom + 4;
    this.menuLeft = rect.left;
    this.isMenuOpen = true;
    this.cdr.markForCheck();
  }

  toggleInlinePicker(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.markForCheck();
  }

  setInterval(interval: RefreshInterval): void {
    this.state.setInterval(interval);
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
