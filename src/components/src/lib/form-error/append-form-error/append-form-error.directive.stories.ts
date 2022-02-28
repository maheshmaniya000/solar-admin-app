import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { TranslocoRootModule } from 'ng-shared/core/transloco-root.module';

import { SgAngularFixesModule } from '../../angular-fixes/angular-fixes.module';
import { SgDefaultsModule } from '../../defaults/defaults.module';
import { FormFieldModule } from '../../form-field/form-field.module';
import { SgValidators } from '../../validators/validators';
import { FormErrorModule } from '../form-error.module';
import { AppendFormErrorTestUtils } from './utils/append-form-error-test.utils';

export default {
  title: 'Solargis/Components/Form Error',
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        FormFieldModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        SgDefaultsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        SgAngularFixesModule,
        HttpClientModule,
        TranslocoRootModule,
        FormErrorModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: '.' }]
    })
  ]
};

const styles = [
  `
  .container {
    width: 500px;
  }
`
];

const fb = new FormBuilder();

export const formControlWithoutValidation: Story = () => ({
  template: `
    <div class="container">
      <div>
        'Required' error message won't be rendered even if input will become
        touched and its value becomes empty.
      </div>
      <mat-form-field doNotAppendFormError>
        <input matInput ngModel required>
      </mat-form-field>
    </div>
  `,
  styles
});

export const onFormField: Story = () => ({
  props: {
    form: fb.group({
      range: fb.group({
        min: [undefined],
        max: [undefined]
      })
    })
  },
  template: `
    <div class="container">
      <div>
        'Required' error message will be rendered when the input inside mat-form-field becomes touched
        and its value becomes empty
      </div>
      <mat-form-field>
        <input type="number" matInput ngModel required>
      </mat-form-field>
      <div>
        When any of the inputs are invalid and touched, the highest priority error
        message of the them will be rendered. Examples (copy paste the values to
        start and end date fields to demonstrate this or write your own valid and
        invalid values):
        <ul>
          <li>Start date invalid, end date valid: 'invalid start date' - 4/25/2021</li>
          <li>Start date valid, end date invalid: 4/25/2021 - 'invalid end date'</li>
          <li>Start date invalid, end date invalid: 'invalid start date' - 'invalid end date'</li>
        </ul>
      </div>
      <mat-form-field [formGroup]="form">
        <mat-label>Enter a date range</mat-label>
        <mat-date-range-input formGroupName="range" [rangePicker]="picker">
          <input matStartDate formControlName="min" placeholder="Start date" data-test="start-date-input">
          <input matEndDate formControlName="max" placeholder="End date" data-test="end-date-input">
        </mat-date-range-input>
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-date-range-picker #picker></mat-date-range-picker>
      </mat-form-field>
    </div>
  `,
  styles
});

export const onCheckbox: Story = () => ({
  props: {
    checkbox: new FormControl(undefined, [Validators.requiredTrue])
  },
  template: `
    <div class="container">
      <div>
        'Required' error message will be rendered when the mat-checkbox becomes touched
        and its value is false
      </div>
      <div>
        <mat-checkbox [formControl]="checkbox" sgAppendFormError></mat-checkbox>
      </div>
    </div>
  `,
  styles
});

export const onFormGroup: Story = () => ({
  props: {
    form: fb.group(
      {
        first: [undefined, [Validators.required]],
        second: [undefined, [Validators.required]]
      },
      {
        validators: [
          (): ValidationErrors => ({
            required: true
          })
        ]
      }
    ),
    customErrors: {
      required: {
        priority: 10,
        translationKey: 'This form group has some error'
      }
    }
  },
  template: `
    <div class="container">
      <div>
        Error message of the whole form group will be rendered when
        some input inside the form group becomes touched
      </div>
      <div class="form-group-container">
        <form
          [formGroup]="form"
          sgAppendFormError
          [customErrors]="customErrors"
        >
          <mat-form-field>
            <input type="number" matInput formControlName="first">
          </mat-form-field>
          <mat-form-field>
            <input type="number" matInput formControlName="second">
          </mat-form-field>
        </form>
      </div>
    </div>
  `,
  styles: [
    ...styles,
    `
      .form-group-container {
        border: 1px solid black;
      }
    `
  ]
});

export const prioritizedErrorsValidation: Story = () => ({
  props: {
    formControl: new FormControl(4.5656, [
      Validators.min(5),
      SgValidators.maxDecimals(2)
    ])
  },
  template: `
    <div class="container">
      <div>
        'Max decimals (2)' error will be rendered even though the 'minimum value (5)'
        validation is also violated. It's because the priority of 'max decimals'
        error is higher than 'minimum value' error.
      </div>
      <mat-form-field>
        <input type="number" matInput [formControl]="formControl">
      </mat-form-field>
    </div>
  `,
  styles
});

export const asyncValidation: Story = () => ({
  props: {
    formControl: new FormControl('some value', undefined, [
      AppendFormErrorTestUtils.asyncRequired(2000)
    ])
  },
  template: `
    <div class="container">
      <div>
        'Required' error message will be rendered in 2 seconds after the input
        becomes touched (at least one blur event was invoked on it) and its value
        becomes empty
      </div>
      <mat-form-field>
        <input matInput [formControl]="formControl">
      </mat-form-field>
    </div>
  `,
  styles
});

const patternValidator = Validators.pattern('^(?=.*[a-z])(?=.*[A-Z]).{8,}$');

export const customErrorMessage: Story = () => ({
  props: {
    formControl: new FormControl(undefined, [patternValidator]),
    formControl2: new FormControl(undefined, [patternValidator]),
    customErrors: {
      pattern: {
        priority: 60,
        translationKey:
          'Password must be at least 8 characters long and contain one lower case and one upper case letter'
      }
    }
  },
  template: `
    <div class="container">
      <div>
        Regex validation
      </div>
      <mat-form-field>
        <input matInput [formControl]="formControl">
      </mat-form-field>
      <div>
        Regex validation with custom message
      </div>
      <mat-form-field [customErrors]="customErrors">
        <input matInput [formControl]="formControl2">
      </mat-form-field>
    </div>
  `,
  styles
});

export const customFormErrorClass: Story = () => ({
  props: {
    formControl: new FormControl(undefined, [Validators.required])
  },
  template: `
    <div class="container">
      <div>'Required' error message will be rendered with a custom class applied.</div>
      <mat-form-field formErrorClass="custom-form-error-class">
        <input matInput [formControl]="formControl">
      </mat-form-field>
    </div>
  `,
  styles: [
    ...styles,
    `
      :host ::ng-deep .custom-form-error-class {
        color: blue;
      }
    `
  ]
});
