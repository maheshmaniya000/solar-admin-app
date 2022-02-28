import { UnitToggle, UnitToggleSettings } from '@solargis/units';

import { UserPreferences } from 'components/models/user-preferences.model';


export interface UserPreferencesDialogInput {
  userPreferences: UserPreferences;
  unitToggles: UnitToggle[];
  unitToggleSettings: UnitToggleSettings;
}
