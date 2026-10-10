import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-color-picker-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-1 w-full">
      <div class="flex items-center justify-between">
        <label *ngIf="label" class="text-xs font-semibold text-[#344054]">
          {{ label }}
          <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
        </label>
        <span *ngIf="badge" class="text-[10px] font-medium text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">
          {{ badge }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Native color picker embedded in swatch -->
        <div class="relative w-9 h-9 shrink-0 rounded-lg border border-[#D0D5DD] p-0.5 bg-white cursor-pointer overflow-hidden shadow-xs">
          <input
            type="color"
            [(ngModel)]="color"
            (ngModelChange)="onColorChange($event)"
            [disabled]="disabled"
            class="absolute -top-2 -left-2 w-14 h-14 cursor-pointer opacity-0"
          />
          <div class="w-full h-full rounded-md border border-black/10" [style.backgroundColor]="color"></div>
        </div>

        <!-- Hex input box -->
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#98A2B3]">#</span>
          <input
            type="text"
            [value]="cleanHex(color)"
            (input)="onHexInput($event)"
            [disabled]="disabled"
            maxlength="6"
            class="w-full h-9 pl-6 pr-3 rounded-lg border border-[#D0D5DD] bg-white text-xs font-mono font-medium text-[#1D2939]
                   focus:outline-none focus:border-[#436CF3] focus:ring-2 focus:ring-[#EFF4FF]
                   disabled:bg-[#F8F9FC] disabled:cursor-not-allowed uppercase transition-all"
          />
        </div>

        <!-- Preset swatches -->
        <div *ngIf="presets.length > 0" class="flex items-center gap-1">
          <button
            *ngFor="let p of presets"
            type="button"
            (click)="selectPreset(p)"
            [disabled]="disabled"
            [style.backgroundColor]="p"
            class="w-5 h-5 rounded-md border border-black/10 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
            [title]="p"
          ></button>
        </div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraColorPickerInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() color = '#436CF3';
  @Input() presets: string[] = ['#436CF3', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  @Output() colorChange = new EventEmitter<string>();

  cleanHex(c: string): string {
    return c.replace(/^#/, '');
  }

  onHexInput(e: any) {
    let val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
    if (val.length === 6) {
      this.color = '#' + val;
      this.colorChange.emit(this.color);
    }
  }

  onColorChange(val: string) {
    this.color = val;
    this.colorChange.emit(this.color);
  }

  selectPreset(p: string) {
    if (this.disabled) return;
    this.color = p;
    this.colorChange.emit(this.color);
  }
}
