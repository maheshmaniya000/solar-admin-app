import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslocoModule } from '@ngneat/transloco';

import { FormErrorComponent } from './append-form-error/form-error-component/form-error.component';
import { AppendFormErrorToCheckboxDirective } from './append-form-error/to-form-check-box/append-form-error-to-checkbox.directive';
import { AppendFormErrorToFormFieldDirective } from './append-form-error/to-form-form-field/append-form-error-to-form-field.directive';
import { AppendFormErrorToFormGroupDirective } from './append-form-error/to-form-group/append-form-error-to-form-group.directive';

@NgModule({
  declarations: [
    AppendFormErrorToFormFieldDirective,
    AppendFormErrorToCheckboxDirective,
    AppendFormErrorToFormGroupDirective,
    FormErrorComponent
  ],
  imports: [CommonModule, TranslocoModule, MatFormFieldModule],
  exports: [
    AppendFormErrorToFormFieldDirective,
    AppendFormErrorToCheckboxDirective,
    AppendFormErrorToFormGroupDirective
  ]
})
export class FormErrorModule {}
