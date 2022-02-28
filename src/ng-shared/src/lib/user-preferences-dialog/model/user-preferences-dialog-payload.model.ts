import { UserPreferences } from 'components/models/user-preferences.model';

import { UnitTogglePayload } from './unit-toggle-payload.model';

export interface UserPreferencesDialogPayload {
  userPreferences?: UserPreferences;
  unitTogglePayload?: UnitTogglePayload;
}
