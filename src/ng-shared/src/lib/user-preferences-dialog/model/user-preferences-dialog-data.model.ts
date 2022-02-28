import { StandardDialogData } from 'components/dialog/standard-dialog/model/standard-dialog-data.model';

import { UserPreferencesDialogInput } from './user-preferences-dialog-input.model';
import { UserPreferencesDialogPayload } from './user-preferences-dialog-payload.model';

export type UserPreferencesDialogData =
  StandardDialogData<[undefined, UserPreferencesDialogPayload]> & UserPreferencesDialogInput;
