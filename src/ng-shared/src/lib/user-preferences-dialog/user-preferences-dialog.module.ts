import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslationModule } from '@solargis/ng-translation';
import { UnitValueModule } from '@solargis/ng-unit-value';

import { DialogModule } from 'components/dialog/dialog.module';
import { TimezoneInputModule } from 'components/timezone-input/timezone-input.module';

import { UserPreferencesDialogContentComponent } from './user-preferences-dialog-content.component';

@NgModule({
  declarations: [UserPreferencesDialogContentComponent],
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    TimezoneInputModule,
    TranslationModule,
    UnitValueModule
  ],
  exports: [UserPreferencesDialogContentComponent]
})
export class UserPreferencesDialogModule {}
