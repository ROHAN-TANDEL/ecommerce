import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'nexora-date',
  imports: [],
  templateUrl: './date.html',
  styleUrl: './date.css',
})
export class DateField {
  @Input() value = '';
  @Input() disabled = false;
  @Input() min = '';
  @Input() max = '';

  @Output() valueChange = new EventEmitter<string>();

  onValueChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.valueChange.emit(input.value);

  }

}
