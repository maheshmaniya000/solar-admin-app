import { AbstractControl } from '@angular/forms';

export function phoneCodeValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (control.value != null) {
    if (typeof control.value === 'object' && !Object.prototype.hasOwnProperty.call(control.value, 'callingCode')) {
      return { phoneCodeInvalid: true };
    }
    if (typeof control.value === 'string') {
      return { phoneCodeIsString: true };
    }
  }
  return null;
}
