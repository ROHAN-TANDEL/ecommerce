import { Component,
  EventEmitter,
  Input,
  Output } from '@angular/core';

import {NexoraActionMap, NexoraActionState} from '../models/nexora-action.model';

@Component({
  selector: 'nexora-form',
  imports: [],
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.css',
})

export class FormBuilder {

  @Input({ required: true })
  name!: string;

  @Input()
  disabled = false;

  @Input()
  readonly = false;

  @Output()
  stateChange = new EventEmitter<void>();

  values: Record<string, any> = {};

  errors: Record<string, string> = {};

  actions: NexoraActionMap = {};

  dirty = false;

  touched = false;

  setValue(name: string, value: any): void {

    if (this.disabled || this.readonly) {
      return;
    }

    this.values[name] = value;

    this.dirty = true;

    this.stateChange.emit();
  }

  getValue<T = any>(name: string): T {
    return this.values[name];
  }

  getValues(): Record<string, any> {
    return {
      ...this.values
    };
  }

  setError(name: string, message: string): void {

    this.errors[name] = message;

    this.stateChange.emit();
  }

  clearErrors(): void {

    this.errors = {};

    this.stateChange.emit();
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  validate(): boolean {
    return !this.hasErrors();
  }

  registerAction(name: string): void {

    if (!this.actions[name]) {

      this.actions[name] = {
        status: 'idle'
      };

    }
  }

  getAction(name: string): NexoraActionState {

    if (!this.actions[name]) {

      this.actions[name] = {
        status: 'idle'
      };

    }

    return this.actions[name];
  }

  isActionLoading(name: string): boolean {

    return this.getAction(name).status === 'loading';
  }

  isActionRunning(name: string): boolean {

    return this.getAction(name).status === 'loading';
  }

  startAction(name: string): void {

    this.registerAction(name);

    this.actions[name] = {
      status: 'loading'
    };

    this.stateChange.emit();
  }

  actionSuccess(name: string): void {

    this.registerAction(name);

    this.actions[name] = {
      status: 'success'
    };

    this.stateChange.emit();
  }

  actionError(name: string, message = 'Something went wrong'): void {

    this.registerAction(name);

    this.actions[name] = {
      status: 'error',
      error: message
    };

    this.stateChange.emit();
  }

  resetAction(name: string): void {

    this.registerAction(name);

    this.actions[name] = {
      status: 'idle'
    };

    this.stateChange.emit();
  }

  reset(): void {

    this.values = {};

    this.errors = {};

    this.dirty = false;

    this.touched = false;

    this.actions = {};

    this.stateChange.emit();
  }

  getState() {

    return {
      name: this.name,
      values: this.getValues(),
      errors: {
        ...this.errors
      },
      actions: {
        ...this.actions
      },
      dirty: this.dirty,
      touched: this.touched
    };
  }

}
