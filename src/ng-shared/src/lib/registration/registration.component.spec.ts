import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatDialogModule } from '@angular/material/dialog';
import {
  createComponentFactory,
  createSpyObject,
  Spectator,
  SpyObject
} from '@ngneat/spectator/jest';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { Store } from '@ngrx/store';

import { DialogService } from 'components/dialog/service/dialog.service';
import { expectToMatchMatDialogSnapshot } from 'components/utils/test';
import { toDataTestAttributeSelector } from 'components/utils/test/to-data-test-attribute-selector';
import { RequireUserLogin } from 'ng-shared/user/actions/auth.actions';

import { RegistrationStep } from './models/registration-step.enum';
import { RegistrationComponent } from './registration.component';
import { RegistrationStore } from './store/registration.store';

import spyOn = jest.spyOn;

xdescribe('RegistrationComponent', () => {
  describe('unit', () => {
    let component: RegistrationComponent;
    let dialogServiceSpyObject: SpyObject<DialogService>;
    let storeSpyObject: SpyObject<Store>;

    beforeEach(() => {
      storeSpyObject = createSpyObject(Store);
      dialogServiceSpyObject = createSpyObject(DialogService);
      component = new RegistrationComponent(
        undefined,
        dialogServiceSpyObject,
        storeSpyObject
      );
    });

    describe('onOpenRegistrationButtonClick', () => {
      it('should open large dialog with provided template', () => {
        component.onOpenRegistrationButtonClick();
        expect(dialogServiceSpyObject.openLargeDialog).toHaveBeenCalledWith(
          component.registrationDialogContent,
          {
            disableClose: true
          }
        );
      });

      describe('onLogInButtonClick', () => {
        it('should dispatch require login action', () => {
          component.onLogInButtonClick();
          expect(storeSpyObject.dispatch).toHaveBeenCalledTimes(1);
          expect(storeSpyObject.dispatch).toHaveBeenCalledWith(
            new RequireUserLogin(undefined)
          );
        });
      });
    });
  });

  describe('component', () => {
    let spectator: Spectator<RegistrationComponent>;
    const createComponent = createComponentFactory({
      component: RegistrationComponent,
      imports: [MatDialogModule, TranslocoTestingModule],
      providers: [DialogService, RegistrationStore],
      mocks: [Store],
      shallow: true
    });

    const clickOnOpenRegistrationButton = (): void =>
      spectator.click(toDataTestAttributeSelector('open-registration-button'));

    beforeEach(() => {
      spectator = createComponent();
    });

    it(`should match snapshot with no dialog and have correctly bound
 methods`, () => {
      const onOpenRegistrationButtonClickSpy = spyOn(
        spectator.component,
        'onOpenRegistrationButtonClick'
      );
      clickOnOpenRegistrationButton();
      expect(onOpenRegistrationButtonClickSpy).toHaveBeenCalledTimes(1);
      expect(spectator.fixture).toMatchSnapshot();
    });

    const continueButtonSelector =
      toDataTestAttributeSelector('continue-button');
    const loginButtonSelector = toDataTestAttributeSelector('login-button');

    describe('onOpenRegistrationButtonClick', () => {
      let rootLoader: HarnessLoader;

      beforeEach(() => {
        rootLoader = TestbedHarnessEnvironment.documentRootLoader(
          spectator.fixture
        );
      });

      it(`should match snapshot of dialog with continue button, footer,
 without back button and have correctly bound attributes and methods`, () => {
        clickOnOpenRegistrationButton();
        expect(
          spectator.query('mat-horizontal-stepper', { root: true })
        ).toEqual(
          expect.objectContaining({
            selectedIndex: 0
          })
        );
        expect(spectator.query('sg-dialog', { root: true })).toEqual(
          expect.objectContaining({
            closeIconButtonEnabled: true,
            dividedContent: false
          })
        );

        const setNextStepSpy = spyOn(
          spectator.component.registrationStore,
          'setNextStep'
        );
        spectator.click(
          spectator.query(continueButtonSelector, {
            root: true
          })
        );
        expect(setNextStepSpy).toHaveBeenCalledTimes(1);

        const onLoginButtonClickSpy = spyOn(
          spectator.component,
          'onLogInButtonClick'
        );
        spectator.click(
          spectator.query(loginButtonSelector, {
            root: true
          })
        );
        expect(onLoginButtonClickSpy).toHaveBeenCalledTimes(1);

        expectToMatchMatDialogSnapshot(rootLoader);
      });

      it(`should contain back button with correctly bound method and not
 contain continue button and login button`, () => {
        spectator.component.registrationStore.patchState({
          step: RegistrationStep.accountVerification
        });
        clickOnOpenRegistrationButton();

        const setPreviousStepSpy = spyOn(
          spectator.component.registrationStore,
          'setPreviousStep'
        );
        spectator.click(
          spectator.query(toDataTestAttributeSelector('back-button'), {
            root: true
          })
        );
        expect(setPreviousStepSpy).toHaveBeenCalledTimes(1);

        expect(
          spectator.query(continueButtonSelector, { root: true })
        ).not.toExist();

        expect(
          spectator.query(loginButtonSelector, { root: true })
        ).not.toExist();
      });
    });
  });
});
