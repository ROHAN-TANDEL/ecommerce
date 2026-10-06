import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TableDensity = 'compact' | 'comfortable' | 'spacious';

@Component({
  selector: 'density-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <button
        type="button"
        (click)="isOpen = !isOpen"
        [ngClass]="{
          'bg-slate-100 border-slate-300 text-slate-900': isOpen,
          'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300': !isOpen
        }"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        title="Density"
      >
        <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Density</span>
        <span class="text-[10px] text-slate-400 capitalize">({{ density }})</span>
        <svg
          class="w-3 h-3 text-slate-400 transition-transform shrink-0"
          [class.rotate-180]="isOpen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Popover (Never clipped, z-[100]) -->
      <div
        *ngIf="isOpen"
        class="absolute left-0 top-full mt-1.5 z-[100] w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5 whitespace-nowrap"
      >
        <div class="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase text-slate-400">
          Row Density
        </div>
        <button
          *ngFor="let opt of options"
          type="button"
          (click)="selectDensity(opt.value)"
          [ngClass]="{
            'bg-slate-100 font-semibold text-slate-900': density === opt.value,
            'text-slate-700 hover:bg-slate-50': density !== opt.value
          }"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-left"
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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}
