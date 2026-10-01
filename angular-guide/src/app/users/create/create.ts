import { Component, ViewChild } from '@angular/core';
import {VerticalSection} from "../../../components/layouts/vertical-section/vertical-section";
import {Sections} from '../../../components/sections/sections';
import {FormField} from '../../../components/form/form-field/form-field';
import {InputField} from '../../../components/form/input/input';
import {ButtonComponent} from '../../../components/form/button/button';
import {FormBuilder} from '../../../components/form/form-builder/form-builder';

@Component({
  selector: 'app-create',
  imports: [
    VerticalSection,
    Sections,
    FormField,
    InputField,
    ButtonComponent,
    FormBuilder
  ],
  templateUrl: './create.html',
  styleUrl: './create.css',
})
export class Create {

  @ViewChild('userForm')
  userForm!: FormBuilder;

  saveUser(): void {

    if (this.userForm.isActionLoading('save')) {
      return;
    }

    this.userForm.clearErrors();

    if (!this.validate()) {
      return;
    }

    this.userForm.startAction('save');

    const payload = this.userForm.getValues();

    console.log('Creating user:', payload);

    setTimeout(() => {

      this.userForm.actionSuccess('save');

      console.log('User created');

      this.userForm.reset();

    }, 2000);
  }

  clearForm(): void {

    if (this.userForm.isActionLoading('save')) {
      return;
    }

    this.userForm.reset();
  }

  validate(): boolean {

    let valid = true;

    const firstName = this.userForm.getValue<string>('firstName');

    const lastName = this.userForm.getValue<string>('lastName');

    const email = this.userForm.getValue<string>('email');

    const password = this.userForm.getValue<string>('password');

    const confirmPassword = this.userForm.getValue<string>('confirmPassword');


    if (!firstName?.trim()) {
      this.userForm.setError('firstName', 'First name is required');
      valid = false;
    }


    if (!lastName?.trim()) {
      this.userForm.setError('lastName', 'Last name is required');
      valid = false;
    }


    if (!email?.trim()) {
      this.userForm.setError('email', 'Email is required');
      valid = false;
    }


    if (!password) {
      this.userForm.setError('password', 'Password is required');
      valid = false;
    }


    if (!confirmPassword) {
      this.userForm.setError('confirmPassword', 'Please confirm your password');
      valid = false;
    }


    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      this.userForm.setError('confirmPassword', 'Passwords do not match');
      valid = false;
    }

    return valid;
  }

}
