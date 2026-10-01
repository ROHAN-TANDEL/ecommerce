import { Component } from '@angular/core';
import { AfterContentInit,  ContentChildren, QueryList } from '@angular/core';
import {NexoraActionMap, NexoraActionState} from '../models/nexora-action.model';
import {FormBuilder} from '../form-builder/form-builder';



@Component({
  selector: 'nexora-master-form-builder',
  imports: [],
  templateUrl: './master-form-builder.html',
  styleUrl: './master-form-builder.css',
})
export class MasterFormBuilder implements AfterContentInit {

  @ContentChildren(
    FormBuilder,
    {
      descendants: true
    }
  )
  forms!: QueryList<FormBuilder>;

  actions: NexoraActionMap = {};

  ngAfterContentInit(): void {

    this.forms.forEach(form => {

      form.stateChange.subscribe(() => {
        // Master can react to child form changes here.
      });

    });
  }

  getForm(name: string): FormBuilder | undefined {

    return this.forms
      .toArray()
      .find(form => form.name === name);
  }

  getForms(): FormBuilder[] {

    return this.forms.toArray();
  }

  getValues(): Record<string, any> {

    const values: Record<string, any> = {};

    this.forms.forEach(form => {

      values[form.name] = form.getValues();

    });

    return values;
  }

  validate(): boolean {

    let valid = true;

    this.forms.forEach(form => {

      if (!form.validate()) {
        valid = false;
      }

    });

    return valid;
  }

  hasErrors(): boolean {

    return this.forms
      .toArray()
      .some(form => form.hasErrors());
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

  startAction(name: string): void {

    this.registerAction(name);

    this.actions[name] = {
      status: 'loading'
    };
  }

  actionSuccess(name: string): void {

    this.registerAction(name);

    this.actions[name] = {
      status: 'success'
    };
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
  }

  resetAction(name: string): void {

    this.registerAction(name);

    this.actions[name] = {
      status: 'idle'
    };
  }

  resetAll(): void {

    this.forms.forEach(form => {
      form.reset();
    });

    this.actions = {};
  }

  getState() {

    return {
      forms: this.forms.map(form => form.getState()),

      actions: {
        ...this.actions
      },

      valid: this.validate(),

      hasErrors: this.hasErrors()
    };
  }
}
