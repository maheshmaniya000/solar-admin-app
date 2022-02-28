import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';

import { Config } from '../../../config';
import { Auth0Service } from '../../services/auth0.service';
import { checkIfMatchingPasswords } from '../../utils/password.validator';

/**
 * Popup dialog to change password
 */
@Component({
  templateUrl: './change-password.dialog.html',
})
export class ChangePasswordDialogComponent {

  isChangingPassword = false; // show/hide spinner
  changePasswordResult; // result of registration process

  form: FormGroup;
  hidePassword = true;

  get oldPassword(): any { return this.form.get('oldPassword'); }
  get newPassword(): any { return this.form.get('newPassword'); }
  get newPasswordConfirm(): any { return this.form.get('newPasswordConfirm'); }

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private readonly fb: FormBuilder,
    public config: Config,
    private readonly auth0Service: Auth0Service,
    private readonly store: Store<any>
  ) {
    this.form = this.fb.group({
      oldPassword: [undefined, [
        Validators.required,
      ]],
      newPassword: [undefined, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(config.auth0.passwordMatchRegexp)
      ]],
      newPasswordConfirm: [undefined, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(config.auth0.passwordMatchRegexp)
      ]]
    }, {
      validator: checkIfMatchingPasswords('newPassword', 'newPasswordConfirm')
    });
  }

  /**
   * Change password action
   */
  changePasswordAction(): void {
    this.isChangingPassword = true;
    const { oldPassword, newPassword } = this.form.value;

    this.auth0Service.changePassword(oldPassword, newPassword)
      .subscribe(res => {
        this.isChangingPassword = false;
        this.changePasswordResult = res;
        this.store.dispatch(new AmplitudeTrackEvent('password_changed'));
      }, () => {
        this.isChangingPassword = false;
        this.changePasswordResult = {
          status: false,
          messageCode: 'unknown'
        };
      });
  }

  openForgotPassword(): void {
    const { email, } = this.form.value;
    this.dialogRef.close({
      openForgotPassword: true,
      email
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
