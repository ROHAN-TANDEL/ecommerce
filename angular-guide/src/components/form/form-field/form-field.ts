import { Component, Input } from '@angular/core';

@Component({
  selector: 'nexora-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
})
export class FormField {
  @Input() label = '';
  @Input() required = false;
  @Input() helpText = '';
  @Input() errorText = '';
  @Input() disabled = false;
}
