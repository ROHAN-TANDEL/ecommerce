import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  NexoraActionMap,
  NexoraActionState
} from '../models/nexora-action.model';

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

  @Input()
  initialValues: Record<string, any> = {};

  @Output()
  stateChange = new EventEmitter<void>();

  values: Record<string, any> = {};
  errors: Record<string, string> = {};
  touchedFields: Record<string, boolean> = {};
  actions: NexoraActionMap = {};

  private initialValuesSnapshot: Record<string, any> = {};

  ngOnInit(): void {
    this.initialize(this.initialValues);
  }

  initialize(values: Record<string, any> = {}): void {
    this.initialValuesSnapshot = this.copyAssignedValues(values);
    this.values = this.copyAssignedValues(values);

    this.errors = {};
    this.touchedFields = {};
    this.actions = {};

    this.stateChange.emit();
  }

  private copyAssignedValues(
    source: Record<string, any>
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key of Object.keys(source)) {
      // undefined means unassigned; null, '', 0 and false are valid values.
      if (source[key] !== undefined) {
        result[key] = source[key];
      }
    }

    return result;
  }

  private hasOwn(
    source: Record<string, any>,
    key: string
  ): boolean {
    return Object.prototype.hasOwnProperty.call(source, key);
  }

  private valuesEqual(a: any, b: any): boolean {
    // Form controls currently primarily use scalar values.
    // Object and array values are compared by reference.
    return Object.is(a, b);
  }

  get dirtyFields(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    const keys = new Set([
      ...Object.keys(this.initialValuesSnapshot),
      ...Object.keys(this.values)
    ]);

    for (const key of keys) {
      const initial = this.hasOwn(this.initialValuesSnapshot, key)
        ? this.initialValuesSnapshot[key]
        : undefined;

      const current = this.hasOwn(this.values, key)
        ? this.values[key]
        : undefined;

      result[key] = !this.valuesEqual(initial, current);
    }

    return result;
  }

  get dirty(): boolean {
    return Object.values(this.dirtyFields).some(Boolean);
  }

  get touched(): boolean {
    return Object.values(this.touchedFields).some(Boolean);
  }

  setValue(name: string, value: any): void {
    if (this.disabled || this.readonly) return;

    if (value === undefined) {
      delete this.values[name];
    } else {
      this.values[name] = value;
    }

    // A field's previous validation error should not persist
    // after its value changes.
    delete this.errors[name];

    this.stateChange.emit();
  }

  markTouched(name: string): void {
    this.touchedFields[name] = true;
    this.stateChange.emit();
  }

  isTouched(name: string): boolean {
    return this.touchedFields[name] === true;
  }

  getValue<T = any>(name: string): T | undefined {
    return this.values[name] as T | undefined;
  }

  getValues(): Record<string, any> {
    return { ...this.values };
  }

  setError(name: string, message: string): void {
    this.errors[name] = message;
    this.stateChange.emit();
  }

  clearError(name: string): void {
    delete this.errors[name];
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

  // Clear current field values without changing the initial baseline.
  clear(): void {
    this.values = {};
    this.errors = {};
    this.touchedFields = {};
    this.stateChange.emit();
  }

  // Restore the values supplied as initialValues.
  reset(): void {
    this.values = this.copyAssignedValues(
      this.initialValuesSnapshot
    );

    this.errors = {};
    this.touchedFields = {};
    this.actions = {};

    this.stateChange.emit();
  }

  registerAction(name: string): void {
    if (!this.actions[name]) {
      this.actions[name] = { status: 'idle' };
    }
  }

  getAction(name: string): NexoraActionState {
    if (!this.actions[name]) {
      this.actions[name] = { status: 'idle' };
    }

    return this.actions[name];
  }

  isActionLoading(name: string): boolean {
    return this.getAction(name).status === 'loading';
  }

  isActionRunning(name: string): boolean {
    return this.isActionLoading(name);
  }

  startAction(name: string): void {
    this.registerAction(name);
    this.actions[name] = { status: 'loading' };
    this.stateChange.emit();
  }

  actionSuccess(name: string): void {
    this.registerAction(name);
    this.actions[name] = { status: 'success' };
    this.stateChange.emit();
  }

  actionError(
    name: string,
    message = 'Something went wrong'
  ): void {
    this.registerAction(name);
    this.actions[name] = {
      status: 'error',
      error: message
    };
    this.stateChange.emit();
  }

  resetAction(name: string): void {
    this.registerAction(name);
    this.actions[name] = { status: 'idle' };
    this.stateChange.emit();
  }

  getState() {
    return {
      name: this.name,
      initialValues: { ...this.initialValuesSnapshot },
      values: this.getValues(),
      errors: { ...this.errors },
      touchedFields: { ...this.touchedFields },
      actions: { ...this.actions },
      dirtyFields: this.dirtyFields,
      dirty: this.dirty,
      touched: this.touched
    };
  }
}
