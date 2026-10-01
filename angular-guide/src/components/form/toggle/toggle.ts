import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'nexora-toggle',
  imports: [],
  templateUrl: './toggle.html',
  styleUrl: './toggle.css',
})
export class Toggle {
  @Input() checked = false;
  @Input() disabled = false;
  @Input() label = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {

    if (this.disabled) {
      return;
    }

    this.checkedChange.emit(!this.checked);

  }
}
