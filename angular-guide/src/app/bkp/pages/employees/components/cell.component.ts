import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrichedColumn } from '../employees.types';

@Component({
  selector: 'cell-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [':host { display: contents; }'],
  template: `
    <td
      [style.width]="column.computedWidth"
      [style.min-width]="column.computedWidth"
      [style.left]="column.stickyLeft || null"
      [class.sticky]="column.isFrozen"
      [class.z-30]="isDropdownOpen"
      [class.z-10]="column.isFrozen && !isDropdownOpen"
      [class.border-r]="column.isFrozen"
      [class.border-slate-200]="column.isFrozen"
      [class.bg-slate-50]="column.isFrozen && isEven && !isSelected"
      [class.bg-white]="column.isFrozen && !isEven && !isSelected"
      [class.bg-[#EEF2FF]]="column.isFrozen && isSelected"
      [class.py-1.5]="density === 'compact'"
      [class.py-2.5]="density === 'comfortable'"
      [class.py-3.5]="density === 'spacious'"
      [class.text-xs]="density === 'compact'"
      [class.text-[13px]]="density === 'comfortable'"
      [class.text-sm]="density === 'spacious'"
      [class.text-right]="isNumericCell()"
      class="px-3.5 align-middle truncate transition-colors duration-100 overflow-visible relative text-slate-700 border-b border-slate-200/60"
    >
      <!-- Edit Mode: Contextual inline edit control matching table theme (Image 1) -->
      <ng-container *ngIf="isEditing && column.editable; else displayMode">

        <!-- Case 1: Custom Dark Dropdown / List Editor (Image 1) -->
        <div *ngIf="column.filter_type === 'list' && column.filter_data && column.filter_data.length > 0; else dateOrTextEditor" class="w-full relative" (click)="$event.stopPropagation()">
          <button
            type="button"
            (click)="toggleDropdown($event)"
            class="w-full h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs flex items-center justify-between text-slate-800 outline-none focus:border-[#436CF3] focus:ring-1 focus:ring-blue-100 shadow-2xs cursor-pointer text-left transition-colors"
          >
            <span class="capitalize truncate font-medium">{{ getSelectedOptionName() }}</span>
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform" [class.rotate-180]="isDropdownOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Custom Light Dropdown Popover -->
          <div
            *ngIf="isDropdownOpen"
            class="absolute left-0 top-full mt-1.5 z-50 min-w-[130px] rounded-xl bg-white p-1 shadow-xl border border-slate-200/90 space-y-0.5 animate-slide-up"
          >
            <button
              *ngFor="let opt of column.filter_data"
              type="button"
              (click)="selectOption(opt.key, $event)"
              [ngClass]="{
                'bg-blue-50 text-[#365BD4] font-medium': isOptionSelected(opt.key),
                'text-slate-700 hover:bg-slate-50 font-normal': !isOptionSelected(opt.key)
              }"
              class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors text-left"
            >
              <span class="capitalize truncate">{{ opt.name }}</span>
              <span *ngIf="isOptionSelected(opt.key)" class="font-bold text-[11px] text-[#436CF3] leading-none shrink-0">✓</span>
            </button>
          </div>
        </div>

        <!-- Case 2: Date Selector (filter_type === 'date_range') -->
        <ng-template #dateOrTextEditor>
          <div *ngIf="column.filter_type === 'date_range'; else textEditor" class="w-full relative">
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              [ngModel]="row[column.key]"
              (ngModelChange)="onModelChange($event)"
              class="w-full h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#436CF3] focus:ring-1 focus:ring-blue-100 shadow-2xs font-mono transition-colors"
            />
          </div>
        </ng-template>

        <!-- Case 3: Search / Text Editor -->
        <ng-template #textEditor>
          <input
            type="text"
            [placeholder]="'Enter ' + column.header_name"
            [ngModel]="row[column.key]"
            (ngModelChange)="onModelChange($event)"
            class="w-full h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#436CF3] focus:ring-1 focus:ring-blue-100 shadow-2xs transition-colors"
          />
        </ng-template>

      </ng-container>

      <!-- Display Mode: Formatted according to cell_mode -->
      <ng-template #displayMode>
        <!-- CELL MODE 1: text_code_1000 (Plain text / Alphanumeric) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_1000'">
          <span class="font-medium text-slate-800 truncate" [title]="row[column.key]">{{ row[column.key] }}</span>
        </ng-container>

        <!-- CELL MODE 2: text_code_2000 (Email / Linked contact) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_2000'">
          <div class="flex items-center gap-1.5 text-slate-600 truncate" [title]="row[column.key]">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="truncate">{{ row[column.key] }}</span>
          </div>
        </ng-container>

        <!-- CELL MODE 3: text_code_3100 (Status Badge) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_3100'">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 shadow-2xs"
            [ngClass]="{
              'bg-emerald-50/80 text-emerald-700 border border-emerald-200/70 ring-1 ring-emerald-500/10': isStatusActive(),
              'bg-amber-50/80 text-amber-700 border border-amber-200/70 ring-1 ring-amber-500/10': isStatusPending(),
              'bg-slate-100/90 text-slate-600 border border-slate-200/80 ring-1 ring-slate-400/10': isStatusInactive(),
              'bg-rose-50/80 text-rose-700 border border-rose-200/70 ring-1 ring-rose-400/15': isStatusDisabled() || isStatusSuspended()
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              [ngClass]="{
                'bg-emerald-500': isStatusActive(),
                'bg-amber-500': isStatusPending(),
                'bg-slate-400': isStatusInactive(),
                'bg-rose-500': isStatusDisabled() || isStatusSuspended()
              }"
            ></span>
            <span class="truncate">{{ getStatusDisplay() }}</span>
          </span>
        </ng-container>

        <!-- CELL MODE 4: text_code_4000 (Timestamp / Date) -->
        <ng-container *ngIf="column.cell_mode === 'text_code_4000'">
          <span class="text-slate-600 truncate" [title]="row[column.key]">{{ row[column.key] }}</span>
        </ng-container>

        <!-- Fallback for unspecified or custom cell_modes -->
        <ng-container *ngIf="column.cell_mode !== 'text_code_1000' && column.cell_mode !== 'text_code_2000' && column.cell_mode !== 'text_code_3100' && column.cell_mode !== 'text_code_4000'">
          <span class="text-slate-800 truncate" [title]="row[column.key]">{{ row[column.key] }}</span>
        </ng-container>
      </ng-template>

    </td>
  `,
})
export class CellComponent {
  @Input({ required: true }) column!: EnrichedColumn;
  @Input({ required: true }) row!: Record<string, any>;
  @Input() isEven = false;
  @Input() isSelected = false;
  @Input() isEditing = false;
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  @Output() valueChange = new EventEmitter<{ key: string; value: any }>();

  isDropdownOpen = false;

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isDropdownOpen = false;
  }

  toggleDropdown(e: MouseEvent): void {
    e.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(optKey: string, e: MouseEvent): void {
    e.stopPropagation();
    this.isDropdownOpen = false;
    if (this.column?.key === 'status') {
      if (optKey.toLowerCase() === 'active') {
        this.row['disabled'] = false;
      } else if (optKey.toLowerCase() === 'disabled') {
        this.row['disabled'] = true;
      }
    }
    this.onModelChange(optKey);
  }

  isRowDisabled(): boolean {
    return this.row?.['disabled'] === true || String(this.row?.['disabled']).toLowerCase() === 'true';
  }

  getStatusRaw(): string {
    return String(this.row?.[this.column?.key] || '').trim().toLowerCase();
  }

  isStatusDisabled(): boolean {
    const raw = this.getStatusRaw();
    return raw === 'disabled' || (this.column?.key === 'status' && this.isRowDisabled());
  }

  isStatusInactive(): boolean {
    const raw = this.getStatusRaw();
    return raw === 'inactive' && !this.isRowDisabled();
  }

  isStatusActive(): boolean {
    return this.getStatusRaw() === 'active' && !this.isRowDisabled();
  }

  isStatusPending(): boolean {
    return this.getStatusRaw() === 'pending';
  }

  isStatusSuspended(): boolean {
    const raw = this.getStatusRaw();
    return raw === 'suspended' || raw === 'deleted';
  }

  getStatusDisplay(): string {
    if (this.column?.key === 'status' && this.isRowDisabled()) {
      return 'DISABLED';
    }
    const val = String(this.row?.[this.column?.key] || '').trim();
    return val ? val.toUpperCase() : '';
  }

  isNumericCell(): boolean {
    if (!this.column) return false;
    if (this.column.filter_type === 'single_number' || this.column.filter_type === 'number_range') {
      return true;
    }
    const val = this.row ? this.row[this.column.key] : null;
    if (typeof val === 'number') return true;
    if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)) && !val.includes('-') && !val.includes('/')) {
      return true;
    }
    return false;
  }

  isOptionSelected(optKey: string): boolean {
    const raw = String(this.row[this.column.key] || '').toLowerCase().trim();
    if (this.column?.key === 'status' && this.isRowDisabled() && optKey.toLowerCase() === 'disabled') {
      return true;
    }
    return raw === optKey.toLowerCase();
  }

  getSelectedOptionName(): string {
    const raw = String(this.row[this.column.key] || '').toLowerCase().trim();
    if (!this.column.filter_data || this.column.filter_data.length === 0) {
      return this.row[this.column.key] || 'Select...';
    }
    const found = this.column.filter_data.find(
      opt => opt.key.toLowerCase() === raw || opt.name.toLowerCase() === raw
    );
    return found ? found.name : (this.row[this.column.key] || 'Select...');
  }

  getSelectedOptionKey(): string {
    const raw = String(this.row[this.column.key] || '').toLowerCase().trim();
    if (!this.column.filter_data || this.column.filter_data.length === 0) return raw;
    const found = this.column.filter_data.find(
      opt => opt.key.toLowerCase() === raw || opt.name.toLowerCase() === raw
    );
    return found ? found.key : this.row[this.column.key];
  }

  onModelChange(newVal: any): void {
    this.row[this.column.key] = newVal;
    this.valueChange.emit({ key: this.column.key, value: newVal });
  }
}

