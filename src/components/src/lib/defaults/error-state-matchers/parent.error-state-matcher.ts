import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { isNotNil } from '../../utils';

export class ParentErrorStateMatcher extends ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return (
      super.isErrorState(control, form) ||
      (isNotNil(control) &&
        isNotNil(control.parent) &&
        control.parent?.touched &&
        isNotNil(control.parent?.errors))
    );
  }
}
