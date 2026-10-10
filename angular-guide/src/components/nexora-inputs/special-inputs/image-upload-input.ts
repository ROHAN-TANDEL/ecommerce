import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-image-upload-input',
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

      <div class="flex items-center gap-3">
        <!-- Preview Avatar / Frame -->
        <div class="relative group">
          <div
            class="w-12 h-12 rounded-lg border border-[#EAECF0] bg-[#F8F9FC] overflow-hidden flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:border-[#436CF3] transition-all"
            (click)="imageInput.click()"
          >
            <img *ngIf="imageUrl" [src]="imageUrl" class="w-full h-full object-cover" />
            <svg *ngIf="!imageUrl" class="w-5 h-5 text-[#98A2B3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>

          <button
            *ngIf="imageUrl && !disabled"
            type="button"
            (click)="removeImage($event)"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-[10px] shadow hover:bg-red-600 focus:outline-none"
          >
            &times;
          </button>
        </div>

        <!-- Buttons and info -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="imageInput.click()"
              [disabled]="disabled"
              class="h-7 px-2.5 rounded-md border border-[#D0D5DD] bg-white text-[11px] font-semibold text-[#344054] hover:bg-[#F8F9FC] focus:outline-none transition-colors cursor-pointer disabled:opacity-40"
            >
              Choose Image
            </button>
            <span *ngIf="imageUrl" class="text-[10px] text-[#10B981] font-medium flex items-center gap-1">
              <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Selected
            </span>
          </div>
          <span class="text-[10px] text-[#667085]">{{ hint || 'PNG, JPG up to 2MB' }}</span>
        </div>

        <input
          #imageInput
          type="file"
          accept="image/*"
          (change)="onImageSelected($event)"
          class="hidden"
        />
      </div>
    </div>
  `
})
export class NexoraImageUploadInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() imageUrl = '';

  @Output() imageUrlChange = new EventEmitter<string>();

  onImageSelected(e: any) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
        this.imageUrlChange.emit(this.imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(e: MouseEvent) {
    e.stopPropagation();
    this.imageUrl = '';
    this.imageUrlChange.emit(this.imageUrl);
  }
}
