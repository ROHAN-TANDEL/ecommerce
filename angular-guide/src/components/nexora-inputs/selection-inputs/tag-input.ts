import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-tag-input',
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

      <div
        class="min-h-9 px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] bg-white flex flex-wrap items-center gap-1.5 transition-all
               focus-within:border-[#436CF3] focus-within:ring-2 focus-within:ring-[#EFF4FF]"
        [class.bg-[#F8F9FC]]="disabled"
      >
        <span
          *ngFor="let tag of tags; let i = index"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFF4FF] text-[#436CF3] text-[11px] font-medium animate-in fade-in zoom-in-95 duration-100"
        >
          <span>{{ tag }}</span>
          <button
            *ngIf="!disabled"
            type="button"
            (click)="removeTag(i)"
            class="hover:text-red-500 focus:outline-none"
          >
            <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </span>

        <input
          type="text"
          [(ngModel)]="newTag"
          (keydown)="onKeydown($event)"
          [disabled]="disabled"
          [placeholder]="tags.length === 0 ? placeholder : 'Add more...'"
          class="flex-1 min-w-[80px] bg-transparent text-xs font-medium text-[#1D2939] placeholder:text-[#98A2B3] focus:outline-none border-none p-0 h-6"
        />
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraTagInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = 'Press Enter or comma to add tag';
  @Input() placeholder = 'Add tags...';
  @Input() required = false;
  @Input() disabled = false;
  @Input() tags: string[] = [];

  @Output() tagsChange = new EventEmitter<string[]>();

  newTag = '';

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    } else if (event.key === 'Backspace' && !this.newTag && this.tags.length > 0) {
      this.removeTag(this.tags.length - 1);
    }
  }

  addTag() {
    const trimmed = this.newTag.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !this.tags.includes(trimmed)) {
      this.tags = [...this.tags, trimmed];
      this.tagsChange.emit(this.tags);
    }
    this.newTag = '';
  }

  removeTag(index: number) {
    this.tags = this.tags.filter((_, i) => i !== index);
    this.tagsChange.emit(this.tags);
  }
}
