import { ElementRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  byText,
  createDirectiveFactory,
  SpectatorDirective
} from '@ngneat/spectator/jest';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { AppendFormErrorTestUtils } from '../utils/append-form-error-test.utils';
import { AppendFormErrorToFormFieldDirective } from './append-form-error-to-form-field.directive';

describe('AppendFormErrorToFormFieldDirective', () => {
  describe('component', () => {
    const createDirective = createDirectiveFactory({
      directive: AppendFormErrorToFormFieldDirective,
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        TranslocoTestingModule.forRoot({ langs: {} })
      ],
      shallow: true
    });
    let spectator: SpectatorDirective<AppendFormErrorToFormFieldDirective>;

    describe('directive presence', () => {
      it(`should not attach directive to mat-form-field element that has
 noAppendError attribute on itself`, () => {
        expect(() =>
          createDirective(`
            <mat-form-field doNotAppendFormError>
              <input matInput ngModel/>
            </mat-form-field>
          `)
        ).toThrow();
      });

      it(`should attach directive to mat-form-field element`, () => {
        spectator = createDirective(`
          <mat-form-field>
            <input matInput ngModel/>
          </mat-form-field>
        `);
        AppendFormErrorTestUtils.expectDirectiveToBePresentOn(
          spectator.query(MatFormField, { read: ElementRef }).nativeElement,
          AppendFormErrorToFormFieldDirective,
          spectator
        );
      });
    });

    describe('error message rendering', () => {
      describe('form control', () => {
        it(`should render error message inside mat-form-field
 that contains invalid and touched form control`, () => {
          const formControl = new FormControl(undefined, {
            validators: Validators.required
          });
          spectator = createDirective(
            `
              <mat-form-field>
                <input matInput [formControl]="formControl"/>
              </mat-form-field>
            `,
            {
              hostProps: { formControl }
            }
          );
          spectator.focus('input');
          spectator.blur('input');

          expect(spectator.fixture).toMatchSnapshot();
        });
      });

      describe('form group', () => {
        let secondFormControl: FormControl;
        let thirdFormControl: FormControl;
        let formGroup: FormGroup;
        const minErrorMessage = 'en.common.validation.min';

        beforeEach(() => {
          secondFormControl = new FormControl(4, Validators.min(5));
          thirdFormControl = new FormControl(11, Validators.max(10));
          formGroup = new FormGroup({
            first: new FormControl('some value', Validators.required),
            second: secondFormControl,
            third: thirdFormControl
          });

          spectator = createDirective(
            `
            <mat-form-field>
              <ng-container [formGroup]="formGroup">
                <input matInput formControlName="first"/>
                <input matInput formControlName="second"/>
                <input matInput formControlName="third"/>
              </ng-container>
            </mat-form-field>
          `,
            {
              hostProps: { formGroup }
            }
          );
        });

        it(`should render the highest priority error message of all touched
 invalid form controls in the form group`, () => {
          secondFormControl.markAsTouched();
          spectator.detectChanges();
          expect(spectator.query(byText(minErrorMessage))).toExist();
        });

        it(`should replace error message of the touched invalid form control
 in the form group with the highest priority error message of all touched invalid
 form controls in the form group when the first one becomes valid`, () => {
          secondFormControl.markAsTouched();
          spectator.detectChanges();
          expect(spectator.query(byText(minErrorMessage))).toExist();
          secondFormControl.setValue(5);
          thirdFormControl.markAsTouched();
          spectator.detectChanges();
          expect(spectator.query(byText('en.common.validation.max'))).toExist();
        });

        it(`should render error message of the form group itself when it's
 invalid and touched and contains the highest priority error of all touched invalid
 form controls`, () => {
          formGroup.setValidators(() => ({ integer: true }));
          secondFormControl.setValue(5);
          thirdFormControl.setValue(10);
          secondFormControl.markAsTouched();
          thirdFormControl.markAsTouched();
          spectator.detectChanges();
          expect(
            spectator.query(byText('en.common.validation.integer'))
          ).toExist();
        });
      });
    });
  });
});
