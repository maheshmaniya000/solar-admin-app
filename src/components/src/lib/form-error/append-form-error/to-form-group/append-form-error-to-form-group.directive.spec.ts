import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import {
  createDirectiveFactory,
  SpectatorDirective
} from '@ngneat/spectator/jest';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { toDataTestAttributeSelector } from '../../../utils/test/to-data-test-attribute-selector';
import { AppendFormErrorTestUtils } from '../utils/append-form-error-test.utils';
import { AppendFormErrorToFormGroupDirective } from './append-form-error-to-form-group.directive';

describe('AppendFormErrorToFormGroupDirective', () => {
  describe('component', () => {
    const templateWithFormGroup = `
      <form [formGroup]="form" sgAppendFormError></form>;
    `;
    const createDirective = createDirectiveFactory({
      directive: AppendFormErrorToFormGroupDirective,
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslocoTestingModule.forRoot({ langs: {} })
      ],
      shallow: true
    });
    let spectator: SpectatorDirective<AppendFormErrorToFormGroupDirective>;

    describe('directive presence', () => {
      it(`should not attach directive to mat-checkbox element without
 sgAppendFormError `, () => {
        expect(() =>
          createDirective(`<form [formGroup]="form"></form>`, {
            hostProps: {
              form: new FormGroup({})
            }
          })
        ).toThrow();
      });

      it(`should attach directive to element with form group directive and
 sgAppendFormError attribute on it`, () => {
        spectator = createDirective(templateWithFormGroup, {
          hostProps: {
            form: new FormGroup({})
          }
        });
        AppendFormErrorTestUtils.expectDirectiveToBePresentOn(
          spectator.query('form'),
          AppendFormErrorToFormGroupDirective,
          spectator
        );
      });

      it(`should attach directive to element with form group name directive
 and sgAppendFormError attribute on it`, () => {
        const fb = new FormBuilder();
        spectator = createDirective(
          `
          <form [formGroup]="form">
            <form
              formGroupName="subForm"
              sgAppendFormError
              data-test="sub-form">
            </form>
          </form>
        `,
          {
            hostProps: {
              form: fb.group({
                subForm: fb.group({})
              })
            }
          }
        );
        AppendFormErrorTestUtils.expectDirectiveToBePresentOn(
          spectator.query(toDataTestAttributeSelector('sub-form')),
          AppendFormErrorToFormGroupDirective,
          spectator
        );
      });
    });

    describe('error message rendering', () => {
      it(`should render error message under invalid and touched form group`, () => {
        const form = new FormGroup({}, [
          (): ValidationErrors => ({
            required: true
          })
        ]);
        spectator = createDirective(templateWithFormGroup, {
          hostProps: { form }
        });
        form.markAsTouched();
        spectator.detectChanges();

        expect(spectator.fixture).toMatchSnapshot();
      });
    });
  });
});
