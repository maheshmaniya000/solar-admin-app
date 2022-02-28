import { AbstractControl } from '@angular/forms';
import { isEmpty } from 'lodash-es';

import { ErrorMessageConfigs } from 'components/form-error/append-form-error/models/error-message-configs.model';

export function listSelectionValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (!isEmpty(control.value)) {
    if (
      (typeof control.value === 'object' && !Object.prototype.hasOwnProperty.call(control.value, 'name')) ||
      typeof control.value === 'string'
    ) {
      return { notSelectedFromList: true };
    }
  }
  return null;
}

export function notSelectedFromListCustomErrors(name: 'country' | 'state' | 'territory'): ErrorMessageConfigs {
  return {
    notSelectedFromList: { priority: 60, translationKey: `user.company.${name}NotSelectedFromList` }
  };
}
