import { FormControl, FormGroupDirective } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { ParentErrorStateMatcher } from './parent.error-state-matcher';

import spyOn = jest.spyOn;
import SpyInstance = jest.SpyInstance;

describe('ParentErrorStateMatcher', () => {
  let errorStateMatcher: ParentErrorStateMatcher;
  let isErrorStateSuperSpy: SpyInstance;

  beforeEach(() => {
    errorStateMatcher = new ParentErrorStateMatcher();
    isErrorStateSuperSpy = spyOn(
      ErrorStateMatcher.prototype,
      'isErrorState'
    ).mockReturnValue(false);
  });

  describe('isErrorState', () => {
    [undefined, null].forEach(value => () =>
      it(`should return false when form control param is ${value}`, () => {
        expect(
          errorStateMatcher.isErrorState(value, expect.any(FormGroupDirective))
        ).toBe(false);
      })
    );

    it('should return false when parent of the form control is null', () => {
      expect(
        errorStateMatcher.isErrorState(
          {} as FormControl,
          expect.any(FormGroupDirective)
        )
      ).toBe(false);
    });

    it('should return false when parent of the form control is not touched', () => {
      expect(
        errorStateMatcher.isErrorState(
          {
            parent: { touched: false, errors: null }
          } as FormControl,
          expect.any(FormGroupDirective)
        )
      ).toBe(false);
    });

    it(`should return false when parent of the form control is touched but
 has no errors`, () => {
      expect(
        errorStateMatcher.isErrorState(
          {
            parent: { touched: true, errors: null }
          } as FormControl,
          expect.any(FormGroupDirective)
        )
      ).toBe(false);
    });

    it(`should return true when parent of the form control is touched and
 has errors`, () => {
      expect(
        errorStateMatcher.isErrorState(
          ({
            parent: { touched: true, errors: { error: true } }
          } as unknown) as FormControl,
          expect.any(FormGroupDirective)
        )
      ).toBe(true);
    });

    it('should return true when default error state matcher returns true', () => {
      isErrorStateSuperSpy.mockReturnValue(true);
      expect(
        errorStateMatcher.isErrorState(
          {
            parent: { touched: false, errors: null }
          } as FormControl,
          expect.any(FormGroupDirective)
        )
      ).toBe(true);
    });
  });
});
