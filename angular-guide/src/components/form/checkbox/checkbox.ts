import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'nexora-checkbox',
  imports: [],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
})
export class Checkbox {
  @Input() label = '';
  @Input() checked = false;
  @Input() disabled = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(event: Event): void {

    const checkbox = event.target as HTMLInputElement;

    this.checkedChange.emit(checkbox.checked);

  }
}
