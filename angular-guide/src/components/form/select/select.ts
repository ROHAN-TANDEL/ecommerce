import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'nexora-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select {
  @Input() options: any[] = [];
  @Input() value = '';
  @Input() placeholder = 'Select an option';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  onValueChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.valueChange.emit(select.value);

  }
}
