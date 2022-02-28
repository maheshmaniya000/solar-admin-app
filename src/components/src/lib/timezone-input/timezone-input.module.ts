import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FormErrorModule } from '../form-error/form-error.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { TimezoneInputComponent } from './timezone-input.component';

@NgModule({
  declarations: [TimezoneInputComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    FormFieldModule,
    FormErrorModule
  ],
  exports: [TimezoneInputComponent]
})
export class TimezoneInputModule {}
