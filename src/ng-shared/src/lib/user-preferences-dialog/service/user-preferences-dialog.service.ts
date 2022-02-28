import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { DialogConstants } from 'components/dialog/dialog.constants';
import { DialogService } from 'components/dialog/service/dialog.service';
import { StandardDialogComponent } from 'components/dialog/standard-dialog/standard-dialog.component';

import { UserPreferencesDialogInput } from '../model/user-preferences-dialog-input.model';
import { UserPreferencesDialogPayload } from '../model/user-preferences-dialog-payload.model';
import { UserPreferencesDialogContentComponent } from '../user-preferences-dialog-content.component';
import { UserPreferencesDialogModule } from '../user-preferences-dialog.module';

@Injectable({
  providedIn: UserPreferencesDialogModule
})
export class UserPreferencesDialogService {
  constructor(private readonly dialogService: DialogService) {}

  open(
    data: UserPreferencesDialogInput
  ): MatDialogRef<StandardDialogComponent, UserPreferencesDialogPayload> {
    return this.dialogService.openStandardDialog({
      data: {
        titleTranslationKey: 'Time and unit settings',
        dividedContent: true,
        content: UserPreferencesDialogContentComponent,
        actions: DialogConstants.createStandardDialogDefaultActions(),
        ...data
      }
    });
  }
}
