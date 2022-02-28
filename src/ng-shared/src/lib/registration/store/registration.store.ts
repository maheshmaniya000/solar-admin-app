import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

import { AccountType } from '../models/account-type.enum';
import { RegistrationStep } from '../models/registration-step.enum';

type RegistrationState = {
  accountType: AccountType;
  step: RegistrationStep;
};

type RegistrationViewModel = {
  step: RegistrationStep;
  backButtonDisplayed: boolean;
  continueButtonDisplayed: boolean;
  footerDisplayed: boolean;
};

const initialState: RegistrationState = {
  step: RegistrationStep.selectAccountType,
  accountType: AccountType.work
};

@Injectable()
export class RegistrationStore extends ComponentStore<RegistrationState> {
  readonly setPreviousStep = this.updater(state => ({
    ...state,
    step: --state.step
  }));

  readonly setNextStep = this.updater(state => ({
    ...state,
    step: ++state.step
  }));

  readonly setAccountType = this.updater((state, accountType: AccountType) => ({
    ...state,
    accountType
  }));

  readonly registrationDialogViewModel$: Observable<RegistrationViewModel> =
    this.select(state => ({
      ...state,
      backButtonDisplayed: state.step !== RegistrationStep.selectAccountType,
      continueButtonDisplayed:
        state.step !== RegistrationStep.accountVerification,
      footerDisplayed: state.step === RegistrationStep.selectAccountType
    }));

  constructor() {
    super(initialState);
  }
}
