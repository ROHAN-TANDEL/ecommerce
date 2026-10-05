import {
  Component, Input, Output, EventEmitter, HostListener, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ColumnDef } from '../models/column-def.model';

export interface ManagedColumn {
  key: string;
  label: string;
  visible?: boolean;
}

@Component({
  selector: 'dt-columns-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [':host { display: inline-block; }'],
  template: `
    <div class="relative inline-flex items-center" (click)="$event.stopPropagation()">
      <button type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5
               text-[11px] font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
        (click)="toggleOpen()"
        title="Manage column visibility">
        <span class="text-[13px]">▦</span>
        <span>Columns</span>
        <span class="text-[9px] text-slate-400">⌄</span>
      </button>

      <div *ngIf="isOpen"
           class="absolute left-0 top-full mt-1.5 z-[500] w-64 rounded-xl border border-slate-200 bg-white shadow-2xl"
           (click)="$event.stopPropagation()">
        <div class="border-b border-slate-100 px-3 py-2">
          <p class="text-[11px] font-semibold text-[#0A173D]">Columns</p>
          <p class="text-[10px] text-slate-400">Show / hide columns</p>
        </div>

        <div class="border-b border-slate-100 px-2 py-1.5">
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">⌕</span>
            <input type="text"
              class="h-7 w-full rounded-md border border-slate-200 pl-6 pr-2 text-[11px] outline-none focus:border-[#436CF3]"
              placeholder="Search columns…"
              [(ngModel)]="searchQuery" />
          </div>
        </div>

        <div class="max-h-52 overflow-y-auto px-1.5 py-1">
          <div *ngFor="let col of filteredColumns"
               class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50">
            <label class="flex flex-1 cursor-pointer items-center gap-2">
              <input type="checkbox"
                class="h-3.5 w-3.5 rounded accent-[#436CF3]"
                [checked]="visibility[col.key] ?? col.visible !== false"
                (change)="toggleColumn(col.key)" />
              <span class="text-[11px] text-slate-700">{{ col.label }}</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <button type="button"
            class="text-[11px] font-medium text-slate-500 hover:text-[#436CF3]"
            (click)="resetAll()">Reset</button>
          <div class="flex gap-1.5">
            <button type="button"
              class="h-6 rounded-md border border-slate-200 bg-white px-2.5 text-[10px] font-medium text-slate-500 hover:bg-slate-50"
              (click)="isOpen = false">Cancel</button>
            <button type="button"
              class="h-6 rounded-md bg-[#436CF3] px-2.5 text-[10px] font-medium text-white hover:bg-[#3557d4]"
              (click)="applyChanges()">Apply</button>
          </div>
        </div>
    </div>
  `
})
export class ColumnsManagerComponent {
  @Input() columns: Array<ColumnDef | ManagedColumn> = [
    { key: 'id',        label: 'ID',         visible: true  },
    { key: 'name',      label: 'Full Name',  visible: true  },
    { key: 'email',     label: 'Email',      visible: true  },
    { key: 'role',      label: 'Role',       visible: true  },
    { key: 'status',    label: 'Status',     visible: true  },
    { key: 'created_at',label: 'Created At', visible: false },
  ];

  @Output() visibilityChange = new EventEmitter<Record<string, boolean>>();
  @Output() reset = new EventEmitter<void>();

  isOpen = false;
  searchQuery = '';
  visibility: Record<string, boolean> = {};

  constructor(
    private readonly elRef: ElementRef<HTMLElement>,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get filteredColumns(): Array<ColumnDef | ManagedColumn> {
    const q = this.searchQuery.toLowerCase().trim();
    return this.columns.filter(c => !q || c.label.toLowerCase().includes(q));
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.visibility = Object.fromEntries(
        this.columns.map(c => [c.key, this.visibility[c.key] ?? c.visible !== false])
      );
    }
    this.cdr.markForCheck();
  }

  toggleColumn(key: string): void {
    this.visibility[key] = !this.visibility[key];
    this.cdr.markForCheck();
  }

  resetAll(): void {
    this.visibility = Object.fromEntries(this.columns.map(c => [c.key, true]));
    this.reset.emit();
    this.cdr.markForCheck();
  }

  applyChanges(): void {
    this.visibilityChange.emit({ ...this.visibility });
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
