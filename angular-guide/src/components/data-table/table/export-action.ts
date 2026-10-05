import {
  Component, Input, Output, EventEmitter, HostListener, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ExportFormat = 'excel' | 'csv';

@Component({
  selector: 'dt-export',
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
        title="Export table data">
        <span class="text-[13px]">⇪</span>
        <span>Export</span>
        <span class="text-[9px] text-slate-400">⌄</span>
      </button>

      <div *ngIf="isOpen"
           class="absolute left-0 top-full mt-1.5 z-[500] min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
           (click)="$event.stopPropagation()">
        <div class="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Export format
        </div>
        <button *ngFor="let fmt of formats" type="button"
          class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[11px] text-slate-700
                 hover:bg-blue-50 hover:text-[#436CF3] transition-colors"
          (click)="triggerExport(fmt)">
          <span class="w-5 text-center font-bold text-slate-500">{{ fmt === 'excel' ? 'X' : 'CSV' }}</span>
          <span class="flex-1">{{ fmt === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)' }}</span>
          <span *ngIf="fmt === 'excel'" class="text-[9px] text-slate-400">max 10k</span>
        </button>
      </div>
    </div>
  `
})
export class ExportActionComponent {
  @Input() formats: ExportFormat[] = ['excel', 'csv'];
  @Output() export = new EventEmitter<ExportFormat>();

  isOpen = false;

  constructor(
    private readonly elRef: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  triggerExport(format: ExportFormat): void {
    this.export.emit(format);
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
