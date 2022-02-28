import { AbstractControl } from '@angular/forms';

// eslint-disable-next-line max-len
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

export function emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (control.value != null) {
    const isEmail = emailRegex.test(control.value);
    if (!isEmail) { return { email: true }; }
  }
  return null;
}
