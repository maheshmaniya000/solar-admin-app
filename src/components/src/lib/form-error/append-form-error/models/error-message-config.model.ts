import { ValidationErrors } from '@angular/forms';
import { HashMap } from '@ngneat/transloco';

export interface ErrorMessageConfig {
  priority: number;
  translationKey: string;
  paramsMapper?: (errors: ValidationErrors) => HashMap;
}
