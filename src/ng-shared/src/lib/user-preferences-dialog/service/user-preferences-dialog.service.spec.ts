import {
  createServiceFactory,
  SpectatorService,
  SpyObject
} from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { DialogConstants } from 'components/dialog/dialog.constants';
import { DialogService } from 'components/dialog/service/dialog.service';
import { Timezone } from 'components/models/timezone.model';
import { runMarbleTest } from 'components/utils/test';

import { UserPreferencesDialogData } from '../model/user-preferences-dialog-data.model';
import { UserPreferencesDialogInput } from '../model/user-preferences-dialog-input.model';
import { UserPreferencesDialogContentComponent } from '../user-preferences-dialog-content.component';
import { UserPreferencesDialogService } from './user-preferences-dialog.service';

describe('UserPreferencesDialogService', () => {
  let spectator: SpectatorService<UserPreferencesDialogService>;
  let dialogServiceSpyObject: SpyObject<DialogService>;
  const createService = createServiceFactory({
    service: UserPreferencesDialogService,
    mocks: [DialogService]
  });

  beforeEach(() => {
    spectator = createService();
    dialogServiceSpyObject = spectator.inject(DialogService);
  });

  describe('openUserPreferencesDialog', () => {
    it(`should call open standard dialog with user preferences dialog data
 and return observable of UserPreferencesDialogPayload type`, () => {
      const dialogInput: UserPreferencesDialogInput = {
        userPreferences: { timezone: Timezone.site },
        unitToggles: [],
        unitToggleSettings: {}
      };
      const dialogData: UserPreferencesDialogData = {
        titleTranslationKey: 'Time and unit settings',
        content: UserPreferencesDialogContentComponent,
        dividedContent: true,
        actions: DialogConstants.createStandardDialogDefaultActions(),
        ...dialogInput
      };
      const resultPayload = dialogData.actions[0].payload;
      dialogServiceSpyObject.openStandardDialog.andReturn({
        afterClosed: () => of(resultPayload)
      });

      runMarbleTest(
        spectator.service.open(dialogInput).afterClosed()
      ).andExpectToEmit('(a|)', { a: resultPayload });
      expect(dialogServiceSpyObject.openStandardDialog).toHaveBeenCalledWith({
        data: dialogData
      });
    });
  });
});
