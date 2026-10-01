import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-radio',
  imports: [],
  templateUrl: './radio.html',
  styleUrl: './radio.css',
})
export class Radio {
  @Input() name = '';
  @Input() options: any[] = [];
  @Input() value = '';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  select(value: string): void {
    this.valueChange.emit(value);
  }
}
