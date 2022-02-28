import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { identity, isNil } from 'lodash-es';
import { minBy }  from 'lodash-es';
import moment, { Moment } from 'moment';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { ErrorMessageConfig } from '../models/error-message-config.model';
import { ErrorMessageConfigs } from '../models/error-message-configs.model';

@Injectable({
  providedIn: 'root'
})
export class AppendFormErrorService {
  private static readonly dateFormat = 'D.M.YYYY';
  private static readonly errorMessageConfigs: ErrorMessageConfigs = {
    required: {
      priority: 10,
      translationKey: AppendFormErrorService.getTranslationKeyPath('required')
    },
    naturalNumber: {
      priority: 20,
      translationKey:
        AppendFormErrorService.getTranslationKeyPath('naturalNumber')
    },
    integer: {
      priority: 30,
      translationKey: AppendFormErrorService.getTranslationKeyPath('integer')
    },
    maxDecimals: {
      priority: 40,
      translationKey:
        AppendFormErrorService.getTranslationKeyPath('maxDecimals')
    },
    min: {
      priority: 50,
      translationKey: AppendFormErrorService.getTranslationKeyPath('min'),
      paramsMapper: ({ min: { min } }) => ({ min })
    },
    max: {
      priority: 50,
      translationKey: AppendFormErrorService.getTranslationKeyPath('max'),
      paramsMapper: ({ max: { max } }) => ({ max })
    },
    phoneNumber: {
      priority: 50,
      translationKey: AppendFormErrorService.getTranslationKeyPath(`phoneNumber`)
    },
    phoneNumberFormat: {
      priority: 50,
      translationKey:
        AppendFormErrorService.getTranslationKeyPath(`phoneNumberFormat`)
    },
    maxlength: {
      priority: 50,
      translationKey: AppendFormErrorService.getTranslationKeyPath('maxLength'),
      paramsMapper: ({ maxlength: { requiredLength } }) => ({ requiredLength })
    },
    minlength: {
      priority: 50,
      translationKey: AppendFormErrorService.getTranslationKeyPath('minLength'),
      paramsMapper: ({ minlength: { requiredLength } }) => ({ requiredLength })
    },
    matStartDateInvalid: {
      priority: 30,
      translationKey:
        AppendFormErrorService.getTranslationKeyPath('startDateInvalid')
    },
    matEndDateInvalid: {
      priority: 30,
      translationKey:
        AppendFormErrorService.getTranslationKeyPath('endDateInvalid')
    },
    matDatepickerMin: {
      priority: 50,
      translationKey: AppendFormErrorService.getTranslationKeyPath('minDate'),
      paramsMapper: ({ matDatepickerMin: { min } }) => ({
        minDate: (min as Moment).format(AppendFormErrorService.dateFormat)
      })
    },
    matDatepickerMax: {
      priority: 50,
      translationKey: AppendFormErrorService.getTranslationKeyPath('maxDate'),
      paramsMapper: ({ matDatepickerMax: { max } }) => ({
        maxDate: (max as Moment).format(AppendFormErrorService.dateFormat)
      })
    },
    matDatepickerParse: {
      priority: 9,
      translationKey:
        AppendFormErrorService.getTranslationKeyPath('datepickerParse'),
      paramsMapper: ({ matDatepickerParse: { text } }) => ({ text })
    },
    sgMaxDateRange: {
      priority: 60,
      translationKey:
        AppendFormErrorService.getTranslationKeyPath('maxDateRange'),
      paramsMapper: ({ sgMaxDateRange: { maxDateRangeInMilliseconds } }) => ({
        days: moment.duration(maxDateRangeInMilliseconds).asDays()
      })
    },
    pattern: {
      priority: 60,
      translationKey: AppendFormErrorService.getTranslationKeyPath('pattern')
    }
  };

  private static getTranslationKeyPath(key: string): string {
    return `common.validation.${key}`;
  }

  constructor(private readonly transloco: TranslocoService) {}

  getHighestPriorityMessage(
    errors: ValidationErrors,
    customErrorMessageConfigs?: ErrorMessageConfigs
  ): Observable<string | undefined> {
    const { paramsMapper, translationKey } = minBy(
      this.getErrorMessageConfigs(errors, customErrorMessageConfigs),
      ({ priority }) => priority
    );
    return this.transloco
      .selectTranslate(translationKey, (paramsMapper ?? identity)(errors))
      .pipe(first());
  }

  private getErrorMessageConfigs(
    errors: ValidationErrors,
    customErrorMessageConfigs: ErrorMessageConfigs = {}
  ): ErrorMessageConfig[] {
    return Object.keys(errors).map(errorKey => {
      const messageConfig =
        customErrorMessageConfigs[errorKey] ??
        AppendFormErrorService.errorMessageConfigs[errorKey];
      if (isNil(messageConfig)) {
        throw new Error(`No ErrorMessageConfig for '${errorKey}'`);
      }
      return messageConfig;
    });
  }
}
