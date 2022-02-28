import { ElementRef } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import {
  createDirectiveFactory,
  SpectatorDirective
} from '@ngneat/spectator/jest';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { AppendFormErrorTestUtils } from '../utils/append-form-error-test.utils';
import { AppendFormErrorToCheckboxDirective } from './append-form-error-to-checkbox.directive';

describe('AppendFormErrorToCheckboxDirective', () => {
  describe('component', () => {
    const createDirective = createDirectiveFactory({
      directive: AppendFormErrorToCheckboxDirective,
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatCheckboxModule,
        TranslocoTestingModule.forRoot({ langs: {} })
      ],
      shallow: true
    });
    let spectator: SpectatorDirective<AppendFormErrorToCheckboxDirective>;

    describe('directive presence', () => {
      it(`should not attach directive to mat-checkbox element without
 sgAppendFormError `, () => {
        expect(() =>
          createDirective(`
            <mat-checkbox ngModel></mat-checkbox>
          `)
        ).toThrow();
      });

      it(`should attach directive to mat-checkbox element without
 sgAppendFormError `, () => {
        spectator = createDirective(`
          <mat-checkbox ngModel sgAppendFormError></mat-checkbox>
        `);
        AppendFormErrorTestUtils.expectDirectiveToBePresentOn(
          spectator.query(MatCheckbox, { read: ElementRef }).nativeElement,
          AppendFormErrorToCheckboxDirective,
          spectator
        );
      });
    });

    describe('error message rendering', () => {
      it(`should render error message under invalid and touched checkbox`, () => {
        const inputElementName = 'input';
        const formControl = new FormControl(undefined, [Validators.required]);
        spectator = createDirective(
          `
            <mat-checkbox
              [formControl]="formControl"
              sgAppendFormError
            >
            </mat-checkbox>`,
          {
            hostProps: { formControl }
          }
        );
        spectator.focus(inputElementName);
        spectator.blur(inputElementName);

        expect(spectator.fixture).toMatchSnapshot();
      });
    });
  });
});
