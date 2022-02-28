import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, delay, filter, first, switchMap, tap } from 'rxjs/operators';

import { CaptchaResult } from '@solargis/types/captcha';
import { TranslationDef } from '@solargis/types/translation';
import { Company, CompanyWithToken } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { Config } from '../../../config';
import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { NewCompany, UpdateCompany } from '../../../user/actions/company.actions';
import { State as UserState } from '../../../user/reducers';
import { selectActiveOrNoCompany } from '../../../user/selectors/company.selectors';
import { CompanyService } from '../../../user/services/company.service';
import { FreeTrialFormStepComponent } from '../../components/free-trial-form-step/free-trial-form-step.component';
import { BillingForm, FreeTrialForm } from '../../types';
import { parsePhone } from '../../user-shared.utils';

/**
 * Popup dialog for adding new company
 */
@Component({
  templateUrl: './add-company-dialog.component.html',
})
export class AddCompanyDialogComponent extends SubscriptionAutoCloseComponent implements OnInit {
  companySaveInProgress = false;
  companyCreated: boolean = null;

  form: FormGroup;
  billingForm: BillingForm;
  freeTrialForm: FreeTrialForm;
  otpCaptcha: CaptchaResult;

  @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
  @ViewChild(FreeTrialFormStepComponent) freeTrialFormStepComponent: FreeTrialFormStepComponent;

  otpError: TranslationDef;

  get fields(): AbstractControl | null { return this.form.get('fields'); }
  get name(): AbstractControl { return this.fields.get([0]).get('name'); }
  get billing(): AbstractControl { return this.fields.get([0]).get('billing'); }
  get trial(): AbstractControl { return this.fields.get([0]).get('trial'); }

  get otp(): AbstractControl { return this.fields.get([1]).get('otp'); }

  constructor(
    private readonly companyService: CompanyService,
    private readonly store: Store<UserState>,
    public dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<AddCompanyDialogComponent>,
    private readonly fb: FormBuilder,
    public config: Config
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      fields: this.fb.array([
        this.fb.group({
          name: [undefined, [Validators.required]],
          billing: [true, []],
          trial: [true, []]
        }),
        this.fb.group({
          otp: [undefined, []]
        })
      ]),
    });
  }

  clickOnEnter(event: any): void {
    if (this.form.valid) {this.next();}
    event.preventDefault();
  }

  save(): void {
    let company: Partial<Company>;

    if (this.billing.value) {
      const { phoneCode, ...originalCompany } = this.billingForm;
      company = {
        ...originalCompany,
        name: this.name.value,
        phone: parsePhone(phoneCode, originalCompany.phone),
        country: removeEmpty({ ...originalCompany.country, states: null }),
        state: originalCompany.country.states?.length > 0 ? originalCompany.state : null
      };
    } else {
      company = this.fields.get([0]).value;
    }

    if (isNil(company) || this.companySaveInProgress) {
      return;
    }

    this.companySaveInProgress = true;

    if (!this.companyCreated) {
      this.companyService.createCompany(company).pipe(
        switchMap((result: CompanyWithToken) => {
          if (result) {
            this.store.dispatch(new NewCompany(result));
            return this.assignProspectFreeTrial();
          }
        })
      ).subscribe(
        () => this.companyCreated = true,
        err => {
          console.error(err);
          this.companyCreated = false;
        },
        () => this.finalizeSave()
      );
    } else {
      this.assignProspectFreeTrial().subscribe(() => this.finalizeSave());
    }
  }

  next(): void {
    const index = this.stepper.selectedIndex;

    if (index === 0) {
      this.billing.value ? this.stepper.next() : this.skipBilling();
    }
    if (index === 1) {
      if (this.trial.value) {
        if (this.billingForm) {this.stepper.next();}
      } else {
        this.skipTrial();
      }
    }
    if (index === 2 && this.freeTrialForm) {
      this.freeTrialFormStepComponent.generateOTP();
    }
    if (index === 3) {
      this.save();
    }
    if (index === 4) {
      this.close();
    }
  }

  back(): void {
    this.otpError = undefined;
    this.stepper.selectedIndex === 2 && !this.billing.value ? this.stepper.selectedIndex = 0 : this.stepper.previous();

    if (this.freeTrialFormStepComponent) {
      this.freeTrialFormStepComponent.resetOTPCaptcha();
    }
  }

  skipBilling(): void {
    this.billing.setValue(false);
    this.trial.value ? this.stepper.selectedIndex = 2 : this.skipTrial();
  }

  skipTrial(): void {
    this.otp.clearValidators();
    this.otp.updateValueAndValidity();

    this.otpError = undefined;
    this.trial.setValue(false);
    this.save();
  }

  stepChanged(stepIndex: number): void {
    if (stepIndex === 0) {
      this.otp.clearValidators();
    }
    if (stepIndex === 1) {
      this.otp.clearValidators();
    }
    if (stepIndex === 2 && this.trial.value) {
      if (!this.freeTrialForm && this.billingForm) {
        this.freeTrialForm = {phone: this.billingForm.phone, phoneCode: this.billingForm.phoneCode};
      }
      this.otp.clearValidators();
    }
    if (stepIndex === 3 && this.trial.value) {
      this.otp.setValidators([Validators.required]);
    }
    this.otp.updateValueAndValidity();
  }

  actionName(): string {
    if (this.stepper) {
      switch (this.stepper.selectedIndex) {
        case 1:
          return 'user.company.action.add';
        case 2:
          return 'common.action.next';
        case 3:
          return 'user.company.action.verify';
        default:
          return 'user.company.action.create';
      }
    } else {
      return 'user.company.action.create';
    }
  }

  isNextButtonDisabled(): boolean {
    return this.form.invalid ||
      (this.stepper.selectedIndex === 1 && !this.billingForm) ||
      (this.stepper.selectedIndex === 2 && (!this.otpCaptcha || !this.freeTrialForm));
  }

  onOtpOutput(output: FreeTrialForm): void {
    this.freeTrialForm = output;
    if (!!output && !!output.result) {this.stepper.next();}
  }

  onOtpError(message: TranslationDef): void {
    if (message) {this.otpError = message;}
    else {this.otpError = undefined;}
  }

  close(): void {
    this.dialogRef.close();
  }

  private assignProspectFreeTrial(): Observable<void> {
    if (!this.trial.value) {
      return of(undefined);
    }

    const phone = parsePhone(this.freeTrialForm.phoneCode, this.freeTrialForm.phone);
    const otp = this.fields.get([1]).get('otp').value;

    return this.store.pipe(
      delay(2000),
      selectActiveOrNoCompany,
      filter(c => c && !c.prospectLicense), // double-check there is no license
      first(),
      switchMap(c => this.companyService.assignProspectFreeTrial(c, phone, otp)),
      tap(cwt => this.store.dispatch(new UpdateCompany(cwt))),
      catchError(() => {
        this.otpError = {
          translate: 'user.company.freeTrial.incorrectVerificationCode'
        };
        return of(undefined);
      })
    );
  }

  private finalizeSave(): void {
    this.companySaveInProgress = false;
    this.stepper.selectedIndex = 4;
  }

}
