import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-drag-handle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class.cursor-grab]="!isDragging"
      [class.cursor-grabbing]="isDragging"
      class="inline-flex items-center justify-center p-1 text-slate-400 hover:text-slate-600 active:text-blue-600 hover:bg-slate-100 rounded transition-colors select-none"
      title="Drag to reorder"
    >
      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
      </svg>
    </span>
  `
})
export class NexoraDragHandleComponent {
  @Input() isDragging = false;
}

@Component({
  selector: 'nexora-sortable-item',
  standalone: true,
  imports: [CommonModule, NexoraDragHandleComponent],
  template: `
    <div
      class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-all gap-3"
      [class.ring-2]="isSelected"
      [class.ring-blue-500]="isSelected"
    >
      <div class="flex items-center gap-3">
        <nexora-drag-handle />
        @if (order !== undefined) {
          <span class="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-600 rounded text-xs font-semibold select-none">
            {{ order }}
          </span>
        }
        <div class="flex flex-col">
          <span class="text-sm font-medium text-slate-800">{{ title }}</span>
          @if (subtitle) {
            <span class="text-xs text-slate-400">{{ subtitle }}</span>
          }
        </div>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          (click)="moveUp.emit()"
          class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
          title="Move Up"
        >
          ▲
        </button>
        <button
          type="button"
          (click)="moveDown.emit()"
          class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
          title="Move Down"
        >
          ▼
        </button>
      </div>
    </div>
  `
})
export class NexoraSortableItemComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() order?: number;
  @Input() isSelected = false;
  @Output() moveUp = new EventEmitter<void>();
  @Output() moveDown = new EventEmitter<void>();
}

@Component({
  selector: 'nexora-reorderable-column',
  standalone: true,
  imports: [CommonModule, NexoraDragHandleComponent],
  template: `
    <div
      class="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg select-none hover:bg-slate-100 transition-colors gap-2"
    >
      <div class="flex items-center gap-2">
        <nexora-drag-handle />
        <input
          type="checkbox"
          [checked]="visible"
          (change)="onVisibilityToggle($event)"
          class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-xs font-medium text-slate-800">{{ label }}</span>
      </div>

      <span class="text-[10px] uppercase font-mono text-slate-400 px-1.5 py-0.5 bg-white border border-slate-200 rounded">
        {{ key }}
      </span>
    </div>
  `
})
export class NexoraReorderableColumnComponent {
  @Input() label = '';
  @Input() key = '';
  @Input() visible = true;
  @Output() visibleChange = new EventEmitter<boolean>();

  onVisibilityToggle(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.visible = checked;
    this.visibleChange.emit(checked);
  }
}
