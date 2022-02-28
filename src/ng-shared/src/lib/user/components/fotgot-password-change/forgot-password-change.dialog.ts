import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { Config } from '../../../config';
import { AmplitudeTrackEvent } from '../../../core/actions/amplitude.actions';
import { Auth0ForgotPasswordChangeDone } from '../../actions/auth.actions';
import { State } from '../../reducers';
import { Auth0Service } from '../../services/auth0.service';
import { checkIfMatchingPasswords } from '../../utils/password.validator';


/**
 * Forgot password dialog - request for email with token to change password
 */
@Component({
  templateUrl: './forgot-password-change.dialog.html',
})
export class ForgotPasswordChangeDialogComponent {

  isResetingPassword = false; // show/hide spinner
  resetPasswordResult; // result of registration process

  form: FormGroup;

  hidePassword = true;
  hidePasswordConfirm = true;

  get newPassword(): any { return this.form.get('newPassword'); }
  get newPasswordConfirm(): any { return this.form.get('newPasswordConfirm'); }

  private token: string;

  constructor(
    private readonly store: Store<State>,
    public dialogRef: MatDialogRef<ForgotPasswordChangeDialogComponent>,
    private readonly fb: FormBuilder,
    public config: Config,
    private readonly auth0Service: Auth0Service,
  ) {
    // check if token is present in store
    this.store.select('user', 'auth0', 'changePasswordToken')
      .pipe(
        first()
      )
      .subscribe(token => {
        if (token) {
          this.token = token;
        } else {
          this.dialogRef.close();
        }
      });

    this.form = this.fb.group({
      newPassword: [undefined, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(config.auth0.passwordMatchRegexp)
      ]],
      newPasswordConfirm: [undefined, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(config.auth0.passwordMatchRegexp)
      ]],
    }, {
      validator: checkIfMatchingPasswords('newPassword', 'newPasswordConfirm')
    });
  }

  /**
   * When user is inside form and hit enter -> confirm forgot password if form is valid
   *
   * @param event
   */
  clickOnEnter(event: any): void {
    if (event.keyCode === 13) {
      if (this.form.valid) {
        this.changePasswordAction();
      }
      event.preventDefault();
    }
  }

  /**
   * Change password action
   */
  changePasswordAction(): void {
    this.isResetingPassword = true;
    this.resetPasswordResult = null;
    const { newPassword } = this.form.value;

    this.auth0Service.forgotPasswordChange(this.token, newPassword)
      .subscribe(res => {
        this.isResetingPassword = false;
        this.resetPasswordResult = res;

        if (!res.status) {
          // something went wrong, reset password
          this.form.reset();
        } else {
          // done, remove token from store
          this.store.dispatch(new Auth0ForgotPasswordChangeDone());
          this.store.dispatch(new AmplitudeTrackEvent('password_changed'));
        }
      }, () => {
        this.isResetingPassword = false;
        this.resetPasswordResult = {
          status: false,
          messageCode: 'unknown'
        };

        // something went wrong, reset password
        this.form.reset();
      });
  }

  /**
   * Open login dialog (but remember email) and close forgot password dialog.
   */
  openLogin(): void {
    this.dialogRef.close();
  }

  /**
   * Just close password dialog.
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * When user changes password, validation of form is not triggered (user needs to changes 'confirm password').
   * This fix problem.
   */
  forcePasswordValidation(): void {
    this.form.controls.newPasswordConfirm.updateValueAndValidity();
  }
}
