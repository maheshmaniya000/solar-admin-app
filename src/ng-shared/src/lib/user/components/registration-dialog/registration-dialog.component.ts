import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatHorizontalStepper} from '@angular/material/stepper';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AnalyticsService } from '@solargis/ng-analytics';
import { CaptchaResult } from '@solargis/types/captcha';
import { TranslationDef } from '@solargis/types/translation';

import { IPGeolocation } from 'ng-shared/core/types';

import { CaptchaComponent } from '../../../captcha/captcha/captcha.component';
import { Config } from '../../../config';
import { AmplitudeTrackEvent } from '../../../core/actions/amplitude.actions';
import { State } from '../../../core/reducers';
import { selectIPGeolocation } from '../../../core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent} from '../../../shared/components/subscription-auto-close.component';
import { FreeTrialFormStepComponent } from '../../../user-shared/components/free-trial-form-step/free-trial-form-step.component';
import { FreeTrialForm } from '../../../user-shared/types';
import { parsePhone } from '../../../user-shared/user-shared.utils';
import { Auth0Login } from '../../actions/auth.actions';
import { Auth0Service } from '../../services/auth0.service';
import { AuthDialogOptions, NewUser, RegistrationForm } from '../../types';

/**
 * Popup dialog for registration of new user
 */
@Component({
  templateUrl: './registration-dialog.component.html',
})
export class RegistrationDialogComponent extends SubscriptionAutoCloseComponent implements OnInit {

  isRegistering = false; // show/hide spinner
  registrationResult; // result of registration process
  ipGeolocation$: Observable<IPGeolocation>;

  opts: AuthDialogOptions;

  form: FormGroup;
  registrationForm: RegistrationForm;
  freeTrialForm: FreeTrialForm;
  otpCaptcha: CaptchaResult;
  captcha: CaptchaResult;
  otpError: TranslationDef;
  withTrial = true;

  @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
  @ViewChild(FreeTrialFormStepComponent) freeTrialFormStepComponent: FreeTrialFormStepComponent;
  @ViewChild(CaptchaComponent) private readonly captchaComponent: CaptchaComponent;

  get fields(): AbstractControl | null { return this.form.get('fields'); }
  get confirmed(): AbstractControl { return this.fields.get([1]).get('confirmed').value; }

  constructor(
    private readonly transloco: TranslocoService,
    private readonly store: Store<State>,
    public dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<RegistrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly data: any,
    private readonly fb: FormBuilder,
    public config: Config,
    private readonly auth0Service: Auth0Service,
    private readonly analytics: AnalyticsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(new AmplitudeTrackEvent('sign_up_started'));

    this.form = this.fb.group({
      fields: this.fb.array([
        this.fb.group({
          otp: [undefined, []]
        }),
        this.fb.group({
          confirmed: [undefined, []],
          captchaType: [undefined, []],
        })
      ]),
    });

    this.opts = this.data.opts || {};

    this.ipGeolocation$ = this.store.pipe(selectIPGeolocation);
  }

  clickOnEnter(event: any): void {
    if (this.form.valid && this.registrationForm) {this.next();}
    event.preventDefault();
  }

  /**
   * Register user action.
   * - change 'isRegistering' to TRUE (display spinner)
   * - when registration process is done (ok/not-ok), change back spinner flag + show result
   */
  registerAction(): void {
    this.captchaComponent?.resetInvisible().then(() => {

      const newUser: NewUser = {
        email: this.data.email,   // required for company invitations, do not remove
        ...this.registrationForm,
        captcha: this.captcha
      };
      const name = this.registrationForm.companyName;
      let createCompany = null;

      if (name) {
        createCompany = { company: { name } };

        if (this.withTrial && this.freeTrialForm) {
          const phone = parsePhone(this.freeTrialForm.phoneCode, this.freeTrialForm.phone);
          const otpCode = this.fields.get([0]).get('otp').value;
          // eslint-disable-next-line @typescript-eslint/naming-convention
          createCompany.assignFreeTrial = { product: 'PROSPECT', phone, OTPCode: otpCode };
          createCompany.company.countryCode = this.freeTrialForm.phoneCode?.code;
        }
      }

      this.registrationResult = undefined;
      this.isRegistering = true;
      this.auth0Service.registerNewUser(
        newUser, this.captcha, this.transloco.getActiveLang(), createCompany, this.opts.companyInvitationTokenId
      ).subscribe(registrationResult => {
        this.isRegistering = false;
        this.registrationResult = registrationResult;

        if (!registrationResult.status) {
          this.form.get('fields').get([1]).get('captchaType').setValue(null);
          this.captchaComponent?.reset();
        } else {
          this.analytics.trackEvent('SIGNUP', 'CREATED-SG2');
          this.store.dispatch(new AmplitudeTrackEvent('sign_up_form_completed'));
          if (this.withTrial) {
            this.store.dispatch(new AmplitudeTrackEvent('free_trial_activated', { freeTrial: { product: 'prospect' }}));
          }

          // if we have company invitation or need to create trial company, login user
          // after login, dispatch afterSuccessAction in all cases
          let action$: Observable<any>;

          if (this.opts.companyInvitationTokenId) {
            action$ = this.auth0Service.loginUser(newUser.email, newUser.password, false).pipe(
              map(loginResult => new Auth0Login(loginResult.tokens, this.data.afterSuccessAction)),
            );
          } else {
            action$ = of(this.data.afterSuccessAction);
          }

          action$.subscribe(action => {
            if (action) {this.store.dispatch(action);}
          });
        }
      }, () => {
        this.isRegistering = false;
        this.captchaComponent?.reset();
        this.registrationResult = {
          status: false,
          messageCode: 'unknown'
        };
      });

    });
  }

  next(): void {
    const step = this.stepper.selectedIndex;

    if (step < 3) {
      if (this.data && this.data.skipTrial && step === 0) { // skip trial steps if registering after invitation
        this.skipTrial();
      } else {
        if (step === 1) {
          this.withTrial = true;
          if (this.freeTrialForm) { this.freeTrialFormStepComponent.generateOTP(); }
        } else {
          this.stepper.next();
        }
      }
    } else {
      this.registerAction();
    }
  }

  back(): void {
    if (this.stepper.selectedIndex === 3 && !this.withTrial) {
      this.stepper.selectedIndex = 1;
    } else {
      this.stepper.previous();
    }
    this.otpError = undefined;
    this.registrationResult = undefined;
    if (this.freeTrialFormStepComponent) {
      this.freeTrialFormStepComponent.resetOTPCaptcha();
    }
  }

  skipTrial(): void {
    const otp = this.fields.get([0]).get('otp');

    otp.clearValidators();
    otp.updateValueAndValidity();

    this.withTrial = false;
    this.stepper.selectedIndex = 3;
    this.otpError = undefined;
  }

  stepChanged(stepIndex: number): void {
    const otp = this.fields.get([0]).get('otp');
    const confirmed = this.fields.get([1]).get('confirmed');
    const captchaType = this.fields.get([1]).get('captchaType');

    if (stepIndex === 0) {
      [ otp, confirmed, captchaType ].map(f => f.clearValidators());
    }
    if (stepIndex === 1) {
      [ otp, confirmed, captchaType ].map(f => f.clearValidators());
    }
    if (stepIndex === 2) {
      otp.setValidators([Validators.required]);
      [ confirmed, captchaType ].map(f => f.clearValidators());
    }
    if (stepIndex === 3) {
      [ confirmed, captchaType ].map(f => f.setValidators([Validators.required]));
    }
    [ otp, confirmed, captchaType ].map(f => f.updateValueAndValidity());
  }

  handleCaptcha(captcha: CaptchaResult): void {
    this.fields.get([1]).get('captchaType').setValue(captcha.captchaType);
    this.captcha = captcha;
  }

  /**
   * Open login dialog and set email (if present)
   */
  openLogin(): void {
    const newUser: NewUser = this.form.getRawValue();
    this.dialogRef.close({
      openLogin: true,
      email: newUser.email
    });
  }

  actionName(): string {
    if (this.stepper) {
      switch (this.stepper.selectedIndex) {
        case 2:
          return 'user.company.action.verify';
        case 3:
          return 'header.registration';
        default:
          return 'common.action.next';
      }
    } else {
      return 'common.action.next';
    }
  }

  isNextButtonDisabled(): boolean {
    return !this.registrationForm || this.form.invalid ||
      (this.stepper.selectedIndex === 1 && (!this.otpCaptcha || !this.freeTrialForm)) ||
      (this.stepper.selectedIndex === 3 && !this.confirmed);
  }

  onOtpOutput(output: FreeTrialForm): void {
    this.freeTrialForm = output;
    if (!!output && !!output.result) {
      this.otpError = undefined;
      this.stepper.next();
    }
  }

  onOtpError(message: TranslationDef): void {
    if (message) {this.otpError = message;}
    else {this.otpError = undefined;}
  }

  close(): void {
    this.dialogRef.close();
  }
}
