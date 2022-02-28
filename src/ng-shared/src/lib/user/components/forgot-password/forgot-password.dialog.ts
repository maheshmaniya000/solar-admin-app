import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { CaptchaResult } from '@solargis/types/captcha';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';

import { CaptchaComponent } from '../../../captcha/captcha/captcha.component';
import { Config } from '../../../config';
import { Auth0Service } from '../../services/auth0.service';
import { emailValidator } from '../../utils/email.validator';

/**
 * Forgot password dialog - request for email with token to change password
 */
@Component({
  templateUrl: './forgot-password.dialog.html',
})
export class ForgotPasswordDialogComponent implements OnInit {

  isResetingPassword = false; // show/hide spinner
  resetPasswordResult; // result of registration process

  form: FormGroup;
  captcha: CaptchaResult;

  @ViewChild(CaptchaComponent) private readonly captchaComponent: CaptchaComponent;

  get email(): any { return this.form.get('email'); }

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly data: any,
    private readonly fb: FormBuilder,
    public config: Config,
    private readonly auth0Service: Auth0Service,
    private readonly store: Store<any>,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [undefined, [ Validators.required, emailValidator ]],
      captchaType: [undefined, [ Validators.required ]],
    });

    // set pre-defined email
    if (this.data.email) {
      this.form.patchValue({
        email: this.data.email
      });
    }
  }

  /**
   * When user is inside form and hit enter -> send forgot pasdword if form is valid
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
    const { email } = this.form.value;

    this.auth0Service.forgotPassword(email, this.captcha)
      .subscribe(res => {
        this.isResetingPassword = false;
        this.resetPasswordResult = res;

        this.store.dispatch(new AmplitudeTrackEvent('password_change_request'));

        if (!res.status) {
          this.form.get('captchaType').setValue(null);
          this.captchaComponent?.reset();
        }
      }, () => {
        this.isResetingPassword = false;
        this.captchaComponent?.reset();
        this.resetPasswordResult = {
          status: false,
          messageCode: 'unknown'
        };
      });
  }

  handleCaptcha(captcha: CaptchaResult): void {
    this.form.get('captchaType').setValue(captcha.captchaType);
    this.captcha = captcha;
  }

  goBack(): void {
    const { email, } = this.form.value;
    this.dialogRef.close({
      goBack: true,
      email
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
