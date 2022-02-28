import { FormControl, ValidatorFn } from '@angular/forms';

type ValidateFn = (val: any) => boolean;

function validateFn(name: string, fn: ValidateFn): ValidatorFn {
  return (c: FormControl) => {
    const val = c.value;
    const isEmpty = typeof val === 'undefined' || val === null || val === '';
    return isEmpty || fn(val) ? null : { [name]: true };
  };
}

export type Range = {
  from?: any;
  to?: any;
  fromInclusive?: boolean;
  toInclusive?: boolean;
};

const rangeDefaults: Range = {
  fromInclusive: true,
  toInclusive: false
};

export function rangeValidator(r: Range): ValidatorFn {
  return (c: FormControl) => {
    const range = { ...rangeDefaults, ...r };
    let fromErrors; let toErrors;
    if (typeof range.from !== 'undefined') {
      fromErrors = range.fromInclusive
        ? validateFn('gte', v => v >= range.from)(c)
        : validateFn('gt', v => v > range.from)(c);
    }
    if (typeof range.to !== 'undefined') {
      toErrors = range.toInclusive
        ? validateFn('lte', v => v <= range.to)(c)
        : validateFn('lt', v => v < range.to)(c);
    }
    if (fromErrors || toErrors) {
      return { range: { ...r, ...fromErrors, ...toErrors } };

    } else {return null;}
  };
}
