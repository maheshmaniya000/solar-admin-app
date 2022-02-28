import { FormGroup, ValidatorFn } from '@angular/forms';

export function firstNameOrLastNameValidator(firstNameKey: string, lastNameKey: string): ValidatorFn {
  return (group: FormGroup): { [key: string]: boolean | null } => {
    const firstName = group.controls[firstNameKey].value;
    const lastName = group.controls[lastNameKey].value;

    if (!firstName?.trim().length && !lastName?.trim().length) {
      return { invalidFirstNameOrLastName: true };
    }
    return null;
  };
}
