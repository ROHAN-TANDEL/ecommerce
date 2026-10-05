import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CascadingNode {
  id: string | number;
  name: string;
  children?: CascadingNode[];
}

@Component({
  selector: 'nexora-cascading-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <!-- Level 1 (e.g. Country) -->
        <div class="relative">
          <select
            [(ngModel)]="level1Id"
            (ngModelChange)="onLevel1Change($event)"
            [disabled]="disabled"
            class="w-full h-9 px-2.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939] focus:outline-none focus:border-[#436CF3] disabled:bg-[#F8F9FC] cursor-pointer"
          >
            <option [ngValue]="null">{{ level1Placeholder }}</option>
            <option *ngFor="let n of data" [ngValue]="n.id">{{ n.name }}</option>
          </select>
        </div>

        <!-- Level 2 (e.g. State) -->
        <div class="relative">
          <select
            [(ngModel)]="level2Id"
            (ngModelChange)="onLevel2Change($event)"
            [disabled]="disabled || !level1Node?.children?.length"
            class="w-full h-9 px-2.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939] focus:outline-none focus:border-[#436CF3] disabled:bg-[#F8F9FC] cursor-pointer disabled:opacity-50"
          >
            <option [ngValue]="null">{{ level2Placeholder }}</option>
            <option *ngFor="let n of level1Node?.children" [ngValue]="n.id">{{ n.name }}</option>
          </select>
        </div>

        <!-- Level 3 (e.g. City) -->
        <div class="relative">
          <select
            [(ngModel)]="level3Id"
            (ngModelChange)="onLevel3Change($event)"
            [disabled]="disabled || !level2Node?.children?.length"
            class="w-full h-9 px-2.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-medium text-[#1D2939] focus:outline-none focus:border-[#436CF3] disabled:bg-[#F8F9FC] cursor-pointer disabled:opacity-50"
          >
            <option [ngValue]="null">{{ level3Placeholder }}</option>
            <option *ngFor="let n of level2Node?.children" [ngValue]="n.id">{{ n.name }}</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class NexoraCascadingSelectorComponent {
  @Input() label = 'Location Hierarchy';
  @Input() level1Placeholder = 'Select Country';
  @Input() level2Placeholder = 'Select State / Region';
  @Input() level3Placeholder = 'Select City';
  @Input() data: CascadingNode[] = [];
  @Input() disabled = false;

  @Input() level1Id: any = null;
  @Input() level2Id: any = null;
  @Input() level3Id: any = null;

  @Output() level1IdChange = new EventEmitter<any>();
  @Output() level2IdChange = new EventEmitter<any>();
  @Output() level3IdChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<{ level1: any; level2: any; level3: any }>();

  get level1Node(): CascadingNode | undefined {
    return this.data.find(d => d.id === this.level1Id);
  }

  get level2Node(): CascadingNode | undefined {
    return this.level1Node?.children?.find(c => c.id === this.level2Id);
  }

  onLevel1Change(val: any): void {
    this.level1Id = val;
    this.level2Id = null;
    this.level3Id = null;
    this.level1IdChange.emit(this.level1Id);
    this.level2IdChange.emit(this.level2Id);
    this.level3IdChange.emit(this.level3Id);
    this.emitChange();
  }

  onLevel2Change(val: any): void {
    this.level2Id = val;
    this.level3Id = null;
    this.level2IdChange.emit(this.level2Id);
    this.level3IdChange.emit(this.level3Id);
    this.emitChange();
  }

  onLevel3Change(val: any): void {
    this.level3Id = val;
    this.level3IdChange.emit(this.level3Id);
    this.emitChange();
  }

  private emitChange(): void {
    this.selectionChange.emit({
      level1: this.level1Id,
      level2: this.level2Id,
      level3: this.level3Id,
    });
  }
}

