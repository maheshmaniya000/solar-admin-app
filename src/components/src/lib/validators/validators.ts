import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import Decimal from 'decimal.js';
import phoneNumberExamples from 'libphonenumber-js/examples.mobile.json';
import { AsYouType, getExampleNumber } from 'libphonenumber-js/min';
import {isEmpty, isNil, trim} from 'lodash-es';
import { Moment } from 'moment';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map } from 'rxjs/operators';

import { isNaturalNumber } from '../utils';

export class SgValidators {
  private static readonly latLngStringFormat = /^-?(((\d|[1-8]\d)(\.\d+)?)|90),-?((([0-9]|[1-9]\d|1[0-7]\d)(\.\d+)?)|180)$/;

  static latLngFormat = (control: AbstractControl): ValidationErrors | null =>
    !control.value || SgValidators.latLngStringFormat.test(control.value)
      ? null
      : { latLngFormat: true };

  static maxDecimals = (maxDecimals: number): ValidatorFn =>
    (control: AbstractControl): ValidationErrors | null =>
      isNil(control.value) || new Decimal(control.value).decimalPlaces() <= maxDecimals
        ? null
        : { maxDecimals };

  static naturalNumber = (
    control: AbstractControl
  ): ValidationErrors | null =>
    isNil(control.value) || isNaturalNumber(control.value)
      ? null
      : { naturalNumber: true };

  static integer = (control: AbstractControl): ValidationErrors | null =>
    isNil(control.value) || Number.isInteger(control.value)
      ? null
      : { integer: true };

  static asyncNaturalNumber(counts$: Observable<number>): AsyncValidatorFn {
    return SgValidators.asyncNumberValidator(
      counts$,
      (value: number): ValidatorFn => (): ValidationErrors | null =>
        isNaturalNumber(value) ? null : { asyncNaturalNumber: true }
    );
  }

  static asyncMax(max$: Observable<number>): AsyncValidatorFn {
    return SgValidators.asyncNumberValidator(max$, Validators.max);
  }

  static asyncMin(min$: Observable<number>): AsyncValidatorFn {
    return SgValidators.asyncNumberValidator(min$, Validators.min);
  }

  static range = (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      throw new Error('Range validator can be used only with FormGroup.');
    }
    const fromFormControl = control.get('from');
    const toFormControl = control.get('to');
    if (isNil(fromFormControl) || isNil(toFormControl)) {
      throw new Error(
        'FormGroup used in range validator needs to have `from` and `to` form controls'
      );
    }
    return isNil(fromFormControl.value) ||
      isNil(toFormControl.value) ||
      fromFormControl.value <= toFormControl.value
      ? null
      : { range: true };
  };

  static conditionalValidator(
    validator: ValidatorFn,
    condition$: Observable<boolean>
  ): ValidatorFn {
    return SgValidators.universalConditionalValidator(
      validator,
      Validators.nullValidator,
      condition$
    );
  }

  static asyncConditionalValidator(
    validator: AsyncValidatorFn,
    condition$: Observable<boolean>
  ): AsyncValidatorFn {
    return SgValidators.universalConditionalValidator(
      validator,
      () => of(null),
      condition$
    );
  }

  static maxDateRange = (maxDateRangeInMilliseconds: number): ValidatorFn => {
    if (maxDateRangeInMilliseconds < 0) {
      throw new Error(
        'Maximum date range in milliseconds param has to be a non-negative value.'
      );
    }

    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormGroup)) {
        throw new Error(
          'Maximum date range validator can be used only with FormGroup.'
        );
      }

      const minFormControl = control.get('min');
      const maxFormControl = control.get('max');
      if (isNil(minFormControl) || isNil(maxFormControl)) {
        throw new Error(
          'FormGroup used in max date range validator needs to have `min` and `max` form controls'
        );
      }

      const min: Moment = minFormControl.value;
      const max: Moment = maxFormControl.value;

      return isNil(min) ||
        isNil(max) ||
        max.diff(min) <= maxDateRangeInMilliseconds
        ? null
        : { sgMaxDateRange: { maxDateRangeInMilliseconds } };
    };
  };

  static phoneNumber = (control: AbstractControl): ValidationErrors | null => {
    const asYouType = new AsYouType();
    asYouType.input(control.value ?? '');
    if(isEmpty(trim(control.value)) || asYouType.isValid()) {
      return null;
    }
    const countryCode = asYouType.getCountry();
    return countryCode
      ? { phoneNumberFormat: getExampleNumber(countryCode, phoneNumberExamples).formatInternational() }
      : { phoneNumber: true };
  };

  private static asyncNumberValidator(
    value$: Observable<number>,
    validatorFactory: (value: number) => ValidatorFn
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
      control.value
        ? value$.pipe(
            map((value): ValidationErrors | null =>
              validatorFactory(value)(control)
            ),
            first()
          )
        : of(null);
  }

  private static universalConditionalValidator<
    T extends ValidatorFn | AsyncValidatorFn
  >(validator: T, nullValidator: T, condition$: Observable<boolean>): T {
    let subscribed = false;
    let currentCondition = true;
    return (control => {
      if (!subscribed) {
        subscribed = true;
        condition$.pipe(distinctUntilChanged(), debounceTime(1)).subscribe(value => {
          currentCondition = value;
          control.updateValueAndValidity();
        });
      }
      return currentCondition === true
        ? validator(control)
        : nullValidator(control);
    }) as T;
  }
}
