import { ValidatorFn, AbstractControl } from '@angular/forms';

export function jsonFormatValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    try {
      JSON.parse(control.value);
      return null;
    } catch (err) {
      return {badJsonFormat: {value: control.value}};
    }
  };
}
