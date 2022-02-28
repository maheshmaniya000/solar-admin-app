import { ValidationErrors } from '@angular/forms';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { HashMap, TranslocoService, TranslocoTestingModule } from '@ngneat/transloco';

import { runMarbleTest } from '../../../utils/test';
import { AppendFormErrorService } from './append-form-error.service';

import SpyInstance = jest.SpyInstance;
import spyOn = jest.spyOn;

describe('AppendFormErrorService', () => {
  let service: AppendFormErrorService;
  let selectTranslateSpy: SpyInstance;

  const createService = createServiceFactory({
    service: AppendFormErrorService,
    imports: [TranslocoTestingModule.forRoot({langs: {}})]
  });

  beforeEach(() => {
    const spectator = createService();
    selectTranslateSpy = spyOn(spectator.inject(TranslocoService), 'selectTranslate');
    service = spectator.service;
  });

  describe('getHighestPriorityMessage', () => {
    (
      [
        {
          errors: {
            required: true,
            min: {
              min: 10,
              actual: 5
            }
          },
          expectedTranslationKey: 'common.validation.required',
          expectedTranslationParams: {}
        },
        {
          errors: {
            maxDecimals: 5,
            max: {
              max: 10,
              actual: 15
            }
          },
          expectedTranslationKey: 'common.validation.maxDecimals',
          expectedTranslationParams: {maxDecimals: 5}
        },
        {
          errors: {
            max: {
              max: 10,
              actual: 15
            }
          },
          expectedTranslationKey: 'common.validation.max',
          expectedTranslationParams: {max: 10}
        }
      ] as {
        errors: ValidationErrors;
        expectedTranslationKey: string;
        expectedTranslationParams: HashMap;
      }[]
    ).forEach(({ errors, expectedTranslationKey, expectedTranslationParams }) =>
      it(`should emit translation of '${expectedTranslationKey}' using correct params when errors are '${JSON.stringify(
        errors
      )}'`, () => {
        runMarbleTest(service.getHighestPriorityMessage(errors)).andExpectToEmit('(a|)', {
          a: `en.${expectedTranslationKey}`
        });

        expect(selectTranslateSpy).toHaveBeenCalledWith(
          expectedTranslationKey,
          expect.objectContaining(expectedTranslationParams)
        );
      })
    );

    it('should prefer custom error config over existing one', () => {
      const customTranslationKey = 'customTranslationKey';

      runMarbleTest(
        service.getHighestPriorityMessage(
          {required: true},
          {
            required: {
              priority: 10,
              translationKey: customTranslationKey
            }
          }
        )).andExpectToEmit('(a|)', {
        a: `en.${customTranslationKey}`
      });
    });

    it('should throw when message for given error is not implemented', () => {
      expect(() =>
        service.getHighestPriorityMessage({
          someNotImplementedError: true
        })
      ).toThrowError(/someNotImplementedError/);
    });
  });
});
