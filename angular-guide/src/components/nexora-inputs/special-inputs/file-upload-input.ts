import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UploadedFile {
  name: string;
  size: string;
  type?: string;
}

@Component({
  selector: 'nexora-file-upload-input',
  standalone: true,
  imports: [CommonModule],
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

      <!-- Upload area -->
      <div
        class="border border-dashed border-[#D0D5DD] hover:border-[#436CF3] bg-white hover:bg-[#F8F9FC] rounded-lg p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
        (click)="fileInput.click()"
        [class.pointer-events-none]="disabled"
        [class.opacity-50]="disabled"
      >
        <input
          #fileInput
          type="file"
          [accept]="accept"
          [multiple]="multiple"
          (change)="onFilesSelected($event)"
          class="hidden"
        />

        <div class="w-7 h-7 rounded-full bg-[#EFF4FF] text-[#436CF3] flex items-center justify-center">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>

        <div class="text-[11px] text-[#344054]">
          <span class="font-semibold text-[#436CF3]">Click to upload</span> or drag and drop
        </div>
        <p class="text-[9px] text-[#98A2B3]">{{ hint || 'SVG, PNG, JPG or GIF (max 800x400px)' }}</p>
      </div>

      <!-- Selected files list -->
      <div *ngIf="files.length > 0" class="flex flex-col gap-1.5 mt-1">
        <div
          *ngFor="let f of files; let idx = index"
          class="flex items-center justify-between p-2 rounded-lg border border-[#EAECF0] bg-[#F8F9FC] text-xs"
        >
          <div class="flex items-center gap-2 truncate">
            <svg class="w-4 h-4 text-[#436CF3] shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm4.75 6.75a.75.75 0 011.5 0v4.44l1.22-1.22a.75.75 0 111.06 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06l1.22 1.22V8.75z" clip-rule="evenodd"/>
            </svg>
            <div class="truncate">
              <span class="font-medium text-[#1D2939] truncate block">{{ f.name }}</span>
              <span class="text-[9px] text-[#667085]">{{ f.size }}</span>
            </div>
          </div>

          <button
            type="button"
            (click)="removeFile(idx, $event)"
            class="text-[#98A2B3] hover:text-[#EF4444] p-1"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class NexoraFileUploadInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() accept = '*/*';
  @Input() multiple = false;
  @Input() files: UploadedFile[] = [];

  @Output() filesChange = new EventEmitter<UploadedFile[]>();

  onFilesSelected(e: any) {
    const fileList: FileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      newFiles.push({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
      });
    }

    if (this.multiple) {
      this.files = [...this.files, ...newFiles];
    } else {
      this.files = newFiles;
    }
    this.filesChange.emit(this.files);
  }

  removeFile(index: number, e: MouseEvent) {
    e.stopPropagation();
    this.files = this.files.filter((_, idx) => idx !== index);
    this.filesChange.emit(this.files);
  }
}
