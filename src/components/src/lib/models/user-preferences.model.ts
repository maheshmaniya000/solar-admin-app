import { Timezone } from './timezone.model';

export interface UserPreferences {
  timezone: Timezone;
  utcOffset?: number;
}
