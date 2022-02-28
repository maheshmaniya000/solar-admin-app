import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

import { DialogModule } from 'components/dialog/dialog.module';
import { StepperModule } from 'components/stepper/stepper.module';

import { RegistrationComponent } from './registration.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    DialogModule,
    StepperModule
  ],
  declarations: [RegistrationComponent],
  exports: [RegistrationComponent]
})
export class RegistrationModule {}
