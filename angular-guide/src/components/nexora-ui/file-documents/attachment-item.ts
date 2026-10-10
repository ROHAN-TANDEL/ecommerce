import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AttachmentFile {
  id: string | number;
  name: string;
  size: string;
  extension?: string;
  url?: string;
}

@Component({
  selector: 'nexora-attachment-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-3 py-2 rounded-lg border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] transition-all flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2 truncate">
        <span class="text-sm">📎</span>
        <span class="font-medium text-[#101828] truncate">{{ item.name }}</span>
        <span class="text-[10px] text-[#667085] shrink-0">({{ item.size }})</span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Download -->
        <button
          type="button"
          (click)="download.emit(item)"
          title="Download"
          class="w-6 h-6 rounded hover:bg-[#EFF4FF] hover:text-[#436CF3] text-[#667085] flex items-center justify-center cursor-pointer transition-colors"
        >
          ⬇
        </button>
        <!-- Remove -->
        <button
          *ngIf="canDelete"
          type="button"
          (click)="removed.emit(item)"
          title="Delete"
          class="w-6 h-6 rounded hover:bg-[#FEF3F2] hover:text-[#B42318] text-[#98A2B3] flex items-center justify-center cursor-pointer transition-colors"
        >
          &times;
        </button>
      </div>
    </div>
  `
})
export class NexoraAttachmentItemComponent {
  @Input() item: AttachmentFile = { id: 1, name: 'document.pdf', size: '1.2 MB' };
  @Input() canDelete = true;

  @Output() download = new EventEmitter<AttachmentFile>();
  @Output() removed = new EventEmitter<AttachmentFile>();
}

@Component({
  selector: 'nexora-attachment-list',
  standalone: true,
  imports: [CommonModule, NexoraAttachmentItemComponent],
  template: `
    <div class="space-y-1.5 w-full">
      <nexora-attachment-item
        *ngFor="let file of items"
        [item]="file"
        [canDelete]="canDelete"
        (download)="download.emit($event)"
        (removed)="removed.emit($event)"
      ></nexora-attachment-item>
    </div>
  `
})
export class NexoraAttachmentListComponent {
  @Input() items: AttachmentFile[] = [];
  @Input() canDelete = true;

  @Output() download = new EventEmitter<AttachmentFile>();
  @Output() removed = new EventEmitter<AttachmentFile>();
}
