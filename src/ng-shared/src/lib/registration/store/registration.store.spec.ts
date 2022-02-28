import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { runMarbleTest } from 'components/utils/test';

import { AccountType } from '../models/account-type.enum';
import { RegistrationStep } from '../models/registration-step.enum';
import { RegistrationStore } from './registration.store';

describe('RegistrationStore', () => {
  const initialState = {
    step: RegistrationStep.selectAccountType,
    accountType: AccountType.work
  };
  let spectator: SpectatorService<RegistrationStore>;
  const createService = createServiceFactory({
    service: RegistrationStore
  });

  const getStep$ = (store: RegistrationStore): Observable<RegistrationStep> =>
    store.state$.pipe(map(({ step }) => step));

  beforeEach(() => {
    spectator = createService();
  });

  it('should match snapshot of enum with correct order of values', () => {
    expect(RegistrationStep).toMatchSnapshot();
  });

  describe('initial state', () => {
    it('should emit correct initial state', () => {
      runMarbleTest(spectator.service.state$).andExpectToEmit('a-', {
        a: initialState
      });
    });
  });

  describe('setPreviousStep', () => {
    it('should emit state with previous step', () => {
      spectator.service.patchState({
        step: RegistrationStep.accountVerification
      });
      spectator.service.setPreviousStep();

      runMarbleTest(getStep$(spectator.service)).andExpectToEmit('a-', {
        a: RegistrationStep.termsAndConditions
      });
    });
  });

  describe('setNextStep', () => {
    it('should emit state with next step', () => {
      spectator.service.setNextStep();

      runMarbleTest(getStep$(spectator.service)).andExpectToEmit('a-', {
        a: RegistrationStep.userInformation
      });
    });
  });

  describe('registrationDialogViewModel$', () => {
    const testProperty = (
      propertyName:
        | 'backButtonDisplayed'
        | 'continueButtonDisplayed'
        | 'footerDisplayed',
      testData: { step: RegistrationStep; expectedValue: boolean }[]
    ): void =>
      testData.forEach(({ step, expectedValue }) =>
        it(`should emit '${expectedValue}' when step is '${RegistrationStep[step]}'`, () => {
          spectator.service.patchState({
            step
          });

          runMarbleTest(
            spectator.service.registrationDialogViewModel$.pipe(
              map(state => state[propertyName])
            )
          ).andExpectToEmit('a-', {
            a: expectedValue
          });
        })
      );

    describe('backButtonDisplayed', () => {
      testProperty('backButtonDisplayed', [
        {
          step: RegistrationStep.selectAccountType,
          expectedValue: false
        },
        {
          step: RegistrationStep.studentInformation,
          expectedValue: true
        }
      ]);
    });

    describe('continueButtonDisplayed', () => {
      testProperty('continueButtonDisplayed', [
        {
          step: RegistrationStep.accountVerification,
          expectedValue: false
        },
        {
          step: RegistrationStep.studentInformation,
          expectedValue: true
        }
      ]);
    });

    describe('footerDisplayed', () => {
      testProperty('footerDisplayed', [
        {
          step: RegistrationStep.accountVerification,
          expectedValue: false
        },
        {
          step: RegistrationStep.selectAccountType,
          expectedValue: true
        }
      ]);
    });
  });
});
