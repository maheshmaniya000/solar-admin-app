import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';

import { CaptchaResult } from '@solargis/types/captcha';
import { TranslationDef } from '@solargis/types/translation';
import { SolargisApp } from '@solargis/types/user-company';

import { AmplitudeTrackEvent } from '../../../core/actions/amplitude.actions';
import { State } from '../../../core/reducers';
import { UpdateCompany } from '../../../user/actions/company.actions';
import { selectActiveOrNoCompany } from '../../../user/selectors/company.selectors';
import { CompanyService } from '../../../user/services/company.service';
import { FreeTrialFormStepComponent } from '../../components/free-trial-form-step/free-trial-form-step.component';
import { FreeTrialForm } from '../../types';
import { parsePhone } from '../../user-shared.utils';

/**
 * Popup dialog for request of free trial
 */
@Component({
  templateUrl: './request-trial-dialog.component.html'
})
export class RequestTrialDialogComponent implements OnInit {
  isRequesting = false; // show/hide spinner
  requestResult; // result of request process

  form: FormGroup;
  freeTrialForm: FreeTrialForm;
  otpCaptcha: CaptchaResult;

  @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
  @ViewChild(FreeTrialFormStepComponent)
  freeTrialFormStepComponent: FreeTrialFormStepComponent;

  constructor(
    private readonly dialogRef: MatDialogRef<RequestTrialDialogComponent>,
    private readonly fb: FormBuilder,
    private readonly store: Store<State>,
    private readonly companyService: CompanyService,
    @Inject(MAT_DIALOG_DATA) private readonly data: { app: SolargisApp }
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      otp: [undefined, []]
    });
  }

  clickOnEnter(event: any): void {
    if (this.form.valid) { this.next(); }
    event.preventDefault();
  }

  next(): void {
    if (this.stepper.selectedIndex === 1) {
      this.requestTrial();
    }
    if (this.stepper.selectedIndex === 0 && this.freeTrialForm) {
      this.freeTrialFormStepComponent.generateOTP();
    }
  }

  back(): void {
    this.stepper.previous();
    this.requestResult = undefined;
    if (this.freeTrialFormStepComponent) {
      this.freeTrialFormStepComponent.resetOTPCaptcha();
    }
  }

  stepChanged(stepIndex: number): void {
    const otp = this.form.get('otp');

    if (stepIndex === 0) {
      otp.clearValidators();
    }
    if (stepIndex === 1) {
      otp.setValidators([Validators.required]);
    }
    otp.updateValueAndValidity();
  }

  requestTrial(): void {
    this.isRequesting = true;
    this.requestResult = undefined;

    const phone = parsePhone(
      this.freeTrialForm.phoneCode,
      this.freeTrialForm.phone
    );
    const otp = this.form.get('otp').value;

    const request$ = this.store.pipe(
      selectActiveOrNoCompany,
      filter(company => company && !company.prospectLicense), // double-check there is no license
      switchMap(company =>
        this.companyService.assignProspectFreeTrial(company, phone, otp)
      ),
      tap(cwt => {
        this.isRequesting = false;
        this.requestResult = {
          status: true,
          message: {
            translate: 'user.company.freeTrial.assignSuccess',
            translateParams: { companyName: cwt.company.name }
          } as TranslationDef
        };
        const validity =
          cwt.company.prospectLicense && cwt.company.prospectLicense.to;
        this.store.dispatch(
          new AmplitudeTrackEvent('free_trial_claimed', {
            freeTrial: {
              product: 'prospect',
              validity: new Date(validity).toISOString()
            }
          })
        );
      }),
      catchError(() => {
        this.isRequesting = false;
        this.requestResult = {
          status: false,
          message: {
            translate: 'user.company.freeTrial.incorrectVerificationCode'
          } as TranslationDef
        };
        return of(undefined);
      }),
      filter(x => !!x)
    );

    request$.subscribe(cwt => {
      if (cwt) {
        this.store.dispatch(new UpdateCompany(cwt));
      }
    });
  }

  onOtpOutput(output: FreeTrialForm): void {
    this.freeTrialForm = output;
    if (!!output && !!output.result) { this.stepper.next(); }
  }

  onOtpError(message: TranslationDef): void {
    if (message) { this.requestResult = { status: false, message }; }
    else { this.requestResult = undefined; }
  }

  close(): void {
    this.dialogRef.close();
  }
}
