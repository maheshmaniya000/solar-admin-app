import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';

import { FormErrorModule } from 'components/form-error/form-error.module';

import { CaptchaModule } from '../captcha/captcha.module';
import { SharedModule } from '../shared/shared.module';
import { AccountMenuComponent } from './components/account-menu/account-menu.component';
import { AddCompanyDialogComponent } from './components/add-company-dialog/add-company-dialog.component';
import { BillingInfoFormComponent } from './components/billing-info-form/billing-info-form.component';
import { CompanyFormComponent } from './components/company-form/company-form.component';
import { FreeTrialFormStepComponent } from './components/free-trial-form-step/free-trial-form-step.component';
import { OtpFormStepComponent } from './components/otp-form-step/otp-form-step.component';
import { PhoneFormFieldComponent } from './components/phone-form-field/phone-form-field.component';
import { RequestTrialDialogComponent } from './components/request-trial-dialog/request-trial-dialog.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { UserCompanyAvatarComponent } from './components/user-company-avatar/user-company-avatar.component';
import { UserCompanyItemComponent } from './components/user-company-item/user-company-item.component';

const COMPONENTS = [
  AccountMenuComponent,
  CompanyFormComponent,
  TermsAndConditionsComponent,
  UserCompanyAvatarComponent,
  UserCompanyItemComponent,
  PhoneFormFieldComponent,
  OtpFormStepComponent,
  FreeTrialFormStepComponent,
  BillingInfoFormComponent
];

const DIALOGS = [
  RequestTrialDialogComponent,
  AddCompanyDialogComponent,
];

@NgModule({
  imports: [
    CaptchaModule,
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    ReactiveFormsModule,
    SharedModule,
    FormErrorModule
  ],
  declarations: [
    ...COMPONENTS,
    ...DIALOGS,
  ],
  exports: [
    ...COMPONENTS,
    ...DIALOGS,
    PhoneFormFieldComponent
  ],
  entryComponents: [
    ...DIALOGS
  ]
})
export class UserSharedModule { }
