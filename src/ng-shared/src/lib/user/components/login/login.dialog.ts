import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import { CaptchaResult } from '@solargis/types/captcha';
import { TranslationDef } from '@solargis/types/translation';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { TranslationSnackbarComponent } from 'ng-shared/shared/components/translation/translation-snackbar.component';

import { Config } from '../../../config';
import { Auth0Login } from '../../actions/auth.actions';
import { State } from '../../reducers';
import { Auth0Service } from '../../services/auth0.service';
import { AuthDialogOptions } from '../../types';
import { emailValidator } from '../../utils/email.validator';


/**
 * Popup dialog for log in of user
 */
@Component({
  moduleId: 'sg-login-dialog',
  templateUrl: './login.dialog.html',
})
export class LoginDialogComponent {

  showSpinner = false;
  loginError: string;

  opts: AuthDialogOptions;

  form: FormGroup;
  rememberMe = true;

  confirmed = false;

  captcha: CaptchaResult = null;
  isSendingEmail = false;

  get password(): any { return this.form.get('password'); }

  constructor(
    private readonly store: Store<State>,
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public config: Config,
    private readonly fb: FormBuilder,
    private readonly auth0Service: Auth0Service,
    private readonly snackBar: MatSnackBar,
    private readonly transloco: TranslocoService,
  ) {
    this.form = this.fb.group({
      email: [undefined, [ Validators.required, emailValidator ]],
      password: [undefined, [ Validators.required ]]
    });

    // set pre-defined email
    if (data.email) {
      this.form.patchValue({
        email: data.email
      });
    }

    this.opts = data.opts || {};
    if (this.opts.disableEmailEdit) {
      this.form.controls.email.disable();
    }

  }

  /**
   * When user is inside form and hit enter -> sign in user if form is valid
   */
  clickOnEnter(event: any): void {
    if (this.form.valid && (!this.opts.showTermsAndConditions || this.confirmed)) {
      this.loginAction();
    }
    event.preventDefault();
  }

  /**
   * Login action by username and password (from popup form).
   */
  loginAction(): void {
    this.showSpinner = true;
    const { email, password } = this.form.getRawValue();
    this.auth0Service.loginUser(email, password, this.rememberMe)
      .subscribe(result => {
        this.showSpinner = false;

        if (this.data && this.data.fromInvitation) {
          // needs to open activation dialog after login
          this.store.dispatch(new Auth0Login(result.tokens));
          this.dialogRef.close({ openInvitation: true });

        } else {
          const afterSuccessAction = this.data.afterSuccessAction;
          this.store.dispatch(new Auth0Login(result.tokens, afterSuccessAction));
          this.store.dispatch(new AmplitudeTrackEvent('login_succesful'));
          this.close();
        }
      }, error => {
        this.form.get('password').reset();
        this.store.dispatch(new AmplitudeTrackEvent('login_error'));

        this.showSpinner = false;
        const loginError = error?.error?.error;

        if (loginError === 'user.deleted') {
          this.loginError = 'deletedUser';
        } else if (loginError === 'auth.invalid_grant') {
          this.loginError = 'error';
        } else if (loginError === 'auth.not_verified') {
          this.loginError = 'notVerified';
        } else {
          this.loginError = 'unknown';
        }
      });
  }

  /**
   * Open registration dialog and set email (if present)
   */
  openRegistration(): void {
    const { email, } = this.form.value;
    this.dialogRef.close({
      openRegistration: true,
      email
    });
  }

  /**
   * Open forgot password dialog (which send link with token to reset password)
   */
  openForgotPassword(): void {
    const { email, } = this.form.value;
    this.dialogRef.close({
      openForgotPassword: true,
      email
    });
  }

  handleCaptcha(captcha: CaptchaResult): void {
    this.captcha = captcha;
  }

  sendNewVerificationEmail(): void {
    if (this.captcha) {
      this.isSendingEmail = true;
      this.auth0Service.sendNewVerificationEmail(this.form.controls.email.value, this.captcha).pipe(
        tap(result => {
          this.captcha = null;
          this.isSendingEmail = false;

          if (result) {
            this.loginError = null;
            this.snackBar.openFromComponent(
              TranslationSnackbarComponent,
              { data: { translate: 'auth.login.notVerifiedConfirm' } as TranslationDef, duration: 10000 }
            );
          } else {
            this.snackBar.openFromComponent(
              TranslationSnackbarComponent,
              { data: { translate: 'auth.forgotPassword.recaptchaNotValid' } as TranslationDef, duration: 10000 }
            );
          }
        })
      ).subscribe();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
