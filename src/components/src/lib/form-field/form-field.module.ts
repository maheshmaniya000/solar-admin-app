import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslocoModule } from '@ngneat/transloco';

import { NoHintDirective } from './no-hint/no-hint.directive';

@NgModule({
  declarations: [NoHintDirective],
  imports: [CommonModule, MatFormFieldModule, TranslocoModule],
  exports: [MatFormFieldModule, NoHintDirective]
})
export class FormFieldModule {}
