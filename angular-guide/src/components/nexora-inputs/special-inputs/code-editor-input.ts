import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nexora-code-editor-input',
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

      <div class="rounded-lg border border-[#344054] bg-[#0F172A] overflow-hidden shadow-xs">
        <!-- Editor Header -->
        <div class="flex items-center justify-between px-3 py-1.5 bg-[#1E293B] border-b border-[#334155]">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span class="text-[10px] font-mono text-[#94A3B8] ml-2">{{ language }}</span>
          </div>

          <button
            type="button"
            (click)="copyCode()"
            class="text-[10px] font-mono text-[#94A3B8] hover:text-white flex items-center gap-1 focus:outline-none"
          >
            <span *ngIf="copied" class="text-[#10B981]">Copied!</span>
            <span *ngIf="!copied">Copy</span>
          </button>
        </div>

        <!-- Code Area with Line Numbers -->
        <div class="flex p-2 text-xs font-mono leading-relaxed">
          <div class="select-none text-[#475569] text-right pr-3 border-r border-[#334155] shrink-0">
            <div *ngFor="let line of lineNumbers">{{ line }}</div>
          </div>

          <textarea
            [(ngModel)]="code"
            (ngModelChange)="onCodeChange($event)"
            [disabled]="disabled"
            spellcheck="false"
            rows="5"
            class="flex-1 pl-3 bg-transparent text-[#38BDF8] resize-none focus:outline-none border-none p-0 overflow-x-auto whitespace-pre"
          ></textarea>
        </div>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraCodeEditorInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() language = 'json';
  @Input() required = false;
  @Input() disabled = false;
  @Input() code = '{\n  "status": "success",\n  "code": 200,\n  "data": []\n}';

  @Output() codeChange = new EventEmitter<string>();

  copied = false;

  get lineNumbers(): number[] {
    const lines = this.code.split('\n').length;
    return Array.from({ length: Math.max(lines, 3) }, (_, i) => i + 1);
  }

  onCodeChange(val: string) {
    this.code = val;
    this.codeChange.emit(this.code);
  }

  copyCode() {
    navigator.clipboard.writeText(this.code);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }
}
