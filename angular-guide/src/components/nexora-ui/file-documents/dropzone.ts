import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-dropzone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (dragover)="onDragOver($event)"
      (dragleave)="isDragging = false"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
      class="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 select-none"
      [class.border-[#436CF3]]="isDragging"
      [class.bg-[#EFF4FF]/40]="isDragging"
      [class.border-[#D0D5DD]]="!isDragging"
      [class.bg-[#F8F9FC]]="!isDragging"
      [class.hover:border-[#436CF3]]="!disabled"
      [class.opacity-50]="disabled"
      [class.pointer-events-none]="disabled"
    >
      <input
        #fileInput
        type="file"
        [multiple]="multiple"
        [accept]="accept"
        (change)="onFileChange($event)"
        class="hidden"
      />

      <div class="w-10 h-10 rounded-full bg-white border border-[#EAECF0] shadow-xs flex items-center justify-center text-[#436CF3] text-lg">
        ☁️
      </div>

      <div class="text-xs text-[#344054]">
        <span class="font-bold text-[#436CF3]">Click to upload</span> or drag and drop
      </div>
      <p class="text-[11px] text-[#667085]">{{ hint || 'PDF, DOCX, CSV, PNG or ZIP up to 25MB' }}</p>
    </div>
  `
})
export class NexoraDropzoneComponent {
  @Input() accept = '*/*';
  @Input() multiple = true;
  @Input() hint = '';
  @Input() disabled = false;

  @Output() filesDropped = new EventEmitter<FileList>();

  isDragging = false;

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled) this.isDragging = true;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    if (!this.disabled && e.dataTransfer?.files) {
      this.filesDropped.emit(e.dataTransfer.files);
    }
  }

  onFileChange(e: any): void {
    if (e.target.files) {
      this.filesDropped.emit(e.target.files);
    }
  }
}
