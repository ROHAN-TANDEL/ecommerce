import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

@Component({
  selector: 'nexora-filter-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 rounded-xl border border-[#EAECF0] bg-white shadow-xs space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-[#EAECF0]">
        <h4 class="text-xs font-bold text-[#101828]">Filter Rules ({{ conditions.length }})</h4>
        <button
          type="button"
          (click)="addCondition()"
          class="text-xs font-semibold text-[#436CF3] hover:underline cursor-pointer"
        >
          + Add Condition
        </button>
      </div>

      <!-- Conditions List -->
      <div *ngIf="conditions.length === 0" class="text-xs text-[#98A2B3] py-2 text-center">
        No active filter rules. Click "+ Add Condition" to create one.
      </div>

      <div *ngFor="let cond of conditions; let i = index" class="flex items-center gap-2">
        <!-- Field -->
        <select
          [(ngModel)]="cond.field"
          (ngModelChange)="emitChange()"
          class="h-8 px-2 rounded-lg border border-[#D0D5DD] text-xs font-medium text-[#1D2939] bg-white cursor-pointer"
        >
          <option *ngFor="let f of availableFields" [value]="f.value">{{ f.label }}</option>
        </select>

        <!-- Operator -->
        <select
          [(ngModel)]="cond.operator"
          (ngModelChange)="emitChange()"
          class="h-8 px-2 rounded-lg border border-[#D0D5DD] text-xs font-medium text-[#1D2939] bg-white cursor-pointer"
        >
          <option value="equals">is equal to</option>
          <option value="contains">contains</option>
          <option value="greater">greater than</option>
          <option value="less">less than</option>
        </select>

        <!-- Value -->
        <input
          type="text"
          [(ngModel)]="cond.value"
          (ngModelChange)="emitChange()"
          placeholder="Value..."
          class="flex-1 h-8 px-2.5 rounded-lg border border-[#D0D5DD] text-xs text-[#1D2939] outline-none focus:border-[#436CF3]"
        />

        <!-- Remove -->
        <button
          type="button"
          (click)="removeCondition(i)"
          class="w-7 h-7 rounded-lg text-[#98A2B3] hover:text-[#B42318] hover:bg-[#FEF3F2] flex items-center justify-center cursor-pointer"
        >
          &times;
        </button>
      </div>
    </div>
  `
})
export class NexoraFilterBuilderComponent {
  @Input() availableFields: { label: string; value: string }[] = [
    { label: 'Status', value: 'status' },
    { label: 'Role', value: 'role' },
    { label: 'Department', value: 'dept' },
    { label: 'Amount', value: 'amount' },
  ];

  @Input() conditions: FilterCondition[] = [];
  @Output() conditionsChange = new EventEmitter<FilterCondition[]>();

  addCondition(): void {
    const firstField = this.availableFields[0]?.value || '';
    this.conditions.push({
      id: Math.random().toString(36).substring(7),
      field: firstField,
      operator: 'equals',
      value: ''
    });
    this.emitChange();
  }

  removeCondition(index: number): void {
    this.conditions.splice(index, 1);
    this.emitChange();
  }

  emitChange(): void {
    this.conditionsChange.emit(this.conditions);
  }
}
