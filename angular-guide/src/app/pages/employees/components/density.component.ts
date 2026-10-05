import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TableDensity = 'compact' | 'comfortable' | 'spacious';

@Component({
  selector: 'density-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left" (click)="$event.stopPropagation()">
      <button
        type="button"
        (click)="isOpen = !isOpen"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
        title="Density"
      >
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Density</span>
        <span class="text-[10px] text-slate-400 capitalize">({{ density }})</span>
      </button>

      <div
        *ngIf="isOpen"
        class="absolute left-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5"
      >
        <div class="px-2 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400">
          Row Density
        </div>
        <button
          *ngFor="let opt of options"
          type="button"
          (click)="selectDensity(opt.value)"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <span>{{ opt.label }}</span>
          <span *ngIf="density === opt.value" class="text-xs font-bold text-slate-900">✓</span>
        </button>
      </div>
    </div>
  `,
})
export class DensityComponent {
  @Input() density: TableDensity = 'comfortable';
  @Output() densityChange = new EventEmitter<TableDensity>();

  isOpen = false;

  readonly options: { value: TableDensity; label: string }[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' },
  ];

  constructor(private readonly elRef: ElementRef) {}

  selectDensity(v: TableDensity): void {
    this.density = v;
    this.isOpen = false;
    this.densityChange.emit(v);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
    }
  }
}
