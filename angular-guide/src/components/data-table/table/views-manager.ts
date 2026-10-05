import {
  Component, Input, Output, EventEmitter, HostListener, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dt-views-manager',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: inline-block; }'],
  template: `
    <div class="relative inline-flex items-center" (click)="$event.stopPropagation()">
      <button type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5
               text-[11px] font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
        (click)="isOpen = !isOpen"
        title="Saved table views">
        <span class="text-[13px]">☷</span>
        <span>View</span>
        <span class="text-[10px] text-slate-400">({{ activeView || 'Default' }})</span>
        <span class="text-[9px] text-slate-400">⌄</span>
      </button>

      <div *ngIf="isOpen"
           class="absolute left-0 top-full mt-1.5 z-[500] min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
           (click)="$event.stopPropagation()">
        <div class="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Saved views
        </div>

        <button type="button"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="selectView('')">
          <span class="w-4 text-[#436CF3]">{{ !activeView ? '✓' : '' }}</span>
          <span>Default</span>
        </button>

        <button *ngFor="let v of savedViews" type="button"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700 hover:bg-blue-50 hover:text-[#436CF3]"
          (click)="selectView(v)">
          <span class="w-4 text-[#436CF3]">{{ activeView === v ? '✓' : '' }}</span>
          <span>{{ v }}</span>
        </button>

        <div class="my-1 border-t border-slate-100"></div>

        <button type="button"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-left text-[11px] font-medium text-[#436CF3] hover:bg-blue-50"
          (click)="triggerSaveView()">
          <span>＋</span>
          <span>Save current view</span>
        </button>

        <button type="button"
          class="flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-500 hover:bg-slate-50"
          (click)="triggerResetView()">
          <span>↶</span>
          <span>Reset view</span>
        </button>
      </div>
    </div>
  `
})
export class ViewsManagerComponent {
  @Input() activeView = '';
  @Input() savedViews: string[] = ['Active Users', 'Pending Approval', 'Admins Only'];
  @Output() viewChange = new EventEmitter<string>();
  @Output() saveView = new EventEmitter<void>();
  @Output() resetView = new EventEmitter<void>();

  isOpen = false;

  constructor(
    private readonly elRef: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  selectView(v: string): void {
    this.activeView = v;
    this.viewChange.emit(v);
    this.isOpen = false;
    this.cdr.markForCheck();
  }

  triggerSaveView(): void {
    this.saveView.emit();
    this.isOpen = false;
    this.cdr.markForCheck();
  }

  triggerResetView(): void {
    this.resetView.emit();
    this.isOpen = false;
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
      this.cdr.markForCheck();
    }
  }
}
