import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'nexora-textarea',
  imports: [],
  templateUrl: './textarea.html',
  styleUrl: './textarea.css',
})
export class Textarea {

  @Input() placeholder = '';
  @Input() value = '';
  @Input() rows = 4;
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() valueChange = new EventEmitter<string>();

  onValueChange(event: Event): void {

    const textarea = event.target as HTMLTextAreaElement;

    this.valueChange.emit(textarea.value);

  }

}
