import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-rich-text-input',
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

      <div
        class="rounded-lg border border-[#D0D5DD] bg-white overflow-hidden focus-within:border-[#436CF3] focus-within:ring-2 focus-within:ring-[#EFF4FF] transition-all"
        [class.bg-[#F8F9FC]]="disabled"
      >
        <!-- Toolbar -->
        <div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#EAECF0] bg-[#F8F9FC]">
          <button
            type="button"
            (click)="execCmd('bold')"
            [disabled]="disabled"
            title="Bold"
            class="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-[#475467] hover:bg-white hover:shadow-xs transition-all disabled:opacity-40"
          >
            B
          </button>
          <button
            type="button"
            (click)="execCmd('italic')"
            [disabled]="disabled"
            title="Italic"
            class="w-6 h-6 rounded flex items-center justify-center italic text-xs font-serif text-[#475467] hover:bg-white hover:shadow-xs transition-all disabled:opacity-40"
          >
            I
          </button>
          <button
            type="button"
            (click)="execCmd('underline')"
            [disabled]="disabled"
            title="Underline"
            class="w-6 h-6 rounded flex items-center justify-center underline text-xs text-[#475467] hover:bg-white hover:shadow-xs transition-all disabled:opacity-40"
          >
            U
          </button>

          <div class="w-px h-3.5 bg-[#D0D5DD] mx-1"></div>

          <button
            type="button"
            (click)="execCmd('insertUnorderedList')"
            [disabled]="disabled"
            title="Bullet List"
            class="w-6 h-6 rounded flex items-center justify-center text-xs text-[#475467] hover:bg-white hover:shadow-xs transition-all disabled:opacity-40"
          >
            &bull;&ndash;
          </button>
          <button
            type="button"
            (click)="execCmd('insertOrderedList')"
            [disabled]="disabled"
            title="Numbered List"
            class="w-6 h-6 rounded flex items-center justify-center text-xs text-[#475467] hover:bg-white hover:shadow-xs transition-all disabled:opacity-40"
          >
            1.
          </button>

          <div class="w-px h-3.5 bg-[#D0D5DD] mx-1"></div>

          <button
            type="button"
            (click)="execCmd('removeFormat')"
            [disabled]="disabled"
            title="Clear formatting"
            class="w-6 h-6 rounded flex items-center justify-center text-[10px] text-[#475467] hover:bg-white hover:shadow-xs transition-all disabled:opacity-40"
          >
            Tx
          </button>
        </div>

        <!-- Editable content -->
        <div
          #editor
          contenteditable="true"
          (input)="onContentInput()"
          [innerHTML]="htmlContent"
          class="p-2.5 min-h-[80px] max-h-[160px] overflow-y-auto text-xs text-[#1D2939] focus:outline-none"
        ></div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraRichTextInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() htmlContent = '<p>Welcome to <strong>Nexora UI</strong> editor.</p>';

  @Output() htmlContentChange = new EventEmitter<string>();

  @ViewChild('editor') editorEl!: ElementRef<HTMLDivElement>;

  execCmd(cmd: string, arg?: string) {
    if (this.disabled) return;
    document.execCommand(cmd, false, arg);
    this.onContentInput();
  }

  onContentInput() {
    if (this.editorEl) {
      this.htmlContent = this.editorEl.nativeElement.innerHTML;
      this.htmlContentChange.emit(this.htmlContent);
    }
  }
}
