import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'nexora-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class InputField {

  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() valueChange = new EventEmitter<string>();

  onValueChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.valueChange.emit(input.value);

  }

}
