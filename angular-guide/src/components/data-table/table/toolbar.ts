import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Toolbar — Table-level fullscreen / collapse / density control bar.
 *
 * TABLE level · Properties: fullscreen, minimized, density
 *
 * Formats: Fullscreen layout, Standard layout, Compact/Comfortable/Spacious density
 *
 * Rules:
 *   • Fullscreen mode changes the table's available visual area without
 *     changing its internal column structure.
 *   • Toolbar, header, body, and footer remain visually associated as one table.
 *   • Table controls must not overlap the data area.
 * Constraints:
 *   • Fullscreen must not change the meaning or order of columns.
 *   • Density changes must affect the table consistently.
 *   • Escape key exits fullscreen automatically.
 */
@Component({
  selector: 'dt-table-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 transition-all"
      [class.bg-slate-50]="fullscreen"
    >
      <!-- Left: title + row count + fullscreen badge -->
      <div class="flex items-center gap-2.5">
        <span class="text-sm font-semibold text-[#0A173D]">{{ title }}</span>
        <span
          *ngIf="rowCount !== null"
          class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[#436CF3]"
        >{{ rowCount | number }}</span>
        <span
          *ngIf="fullscreen"
          class="rounded-full bg-[#436CF3] px-2 py-0.5 text-[9px] font-semibold text-white tracking-wide"
        >FULLSCREEN</span>
      </div>

      <!-- Right: density + collapse + fullscreen -->
      <div class="flex items-center gap-1.5">

        <!-- Density toggle group -->
        <div class="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            *ngFor="let d of densityOptions"
            type="button"
            class="h-6 rounded-md px-2 text-[10px] font-medium transition-colors"
            [class.bg-white]="density === d.value"
            [class.text-[#436CF3]]="density === d.value"
            [class.shadow-sm]="density === d.value"
            [class.text-slate-400]="density !== d.value"
            [title]="d.label + ' density'"
            (click)="densityChange.emit(d.value)"
          >{{ d.icon }}</button>
        </div>

        <div class="mx-1 h-5 w-px bg-slate-200"></div>

        <!-- Collapse toggle -->
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200
                 bg-white text-slate-500 text-sm transition-colors
                 hover:bg-slate-50 hover:text-[#436CF3]"
          [title]="minimized ? 'Expand table' : 'Collapse table'"
          [attr.aria-label]="minimized ? 'Expand table' : 'Collapse table'"
          (click)="minimizedChange.emit(!minimized)"
        >{{ minimized ? '▽' : '△' }}</button>

        <!-- Fullscreen toggle -->
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200
                 bg-white text-[13px] transition-colors hover:bg-slate-50"
          [class.text-[#436CF3]]="fullscreen"
          [class.text-slate-500]="!fullscreen"
          [title]="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          [attr.aria-label]="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          (click)="fullscreenChange.emit(!fullscreen)"
        >⛶</button>

      </div>
    </div>
  `,
})
export class MinimizeMaximiseTable {
  @Input() title: string = 'Table';
  @Input() rowCount: number | null = null;
  @Input() fullscreen: boolean = false;
  @Input() minimized: boolean = false;
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';

  @Output() fullscreenChange = new EventEmitter<boolean>();
  @Output() minimizedChange  = new EventEmitter<boolean>();
  @Output() densityChange    = new EventEmitter<'compact' | 'comfortable' | 'spacious'>();

  readonly densityOptions = [
    { value: 'compact'     as const, icon: '▤', label: 'Compact'     },
    { value: 'comfortable' as const, icon: '▦', label: 'Comfortable' },
    { value: 'spacious'    as const, icon: '▧', label: 'Spacious'    },
  ];

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.fullscreen) this.fullscreenChange.emit(false); }
}
