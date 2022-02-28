import { select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { DateTimeSettings } from '@solargis/types/user-company';
import { UnitToggleSettings } from '@solargis/units';

import { isNotNil } from 'components/utils';

import { State } from '../reducers';
import { TranslateSettings, IPGeolocation } from '../types';

const dateTimeFormatSelector = (state: State): DateTimeSettings => state.settings.dateTimeFormat;
const toggleSettingsSelector = (state: State): UnitToggleSettings => state.settings.toggle;
const translateSettingsSelector = (state: State): TranslateSettings => state.settings.translate;
const geolocationSelector = (state: State): IPGeolocation => state.settings.geolocation;

export const selectUnitToggle = pipe(
  select(toggleSettingsSelector)
);

export const selectDateTimeFormat = pipe(
  select(dateTimeFormatSelector)
);

export const selectIPGeolocation = pipe(
  select(geolocationSelector),
  filter((loc: IPGeolocation) => isNotNil(loc?.provider))
);

export const selectIPGeolocationCountry = pipe(
  selectIPGeolocation,
  map((location: IPGeolocation) => location.countryCode)
);

export const selectSelectedLang = pipe(
  select(translateSettingsSelector),
  map((translateState: TranslateSettings) => translateState.lang)
);
