import { combineReducers } from '@ngrx/store';
import { isEqual } from 'lodash-es';

import { DateTimeSettings } from '@solargis/types/user-company';
import { UnitToggleSettings } from '@solargis/units';

import { availableLanguages } from 'ng-shared/core/models';

import * as SettingsActions from '../actions/settings.actions';
import {
  CookiesSettings,
  IPGeolocation,
  PagesSettings,
  SelectedLayers,
  Settings,
  TranslateSettings
} from '../types';

function getDefaultLanguage(): string {
  const order = [navigator.language, ...navigator.languages, 'en'];
  for (const browserLanguage of order) {
    const found = availableLanguages.find(lang => browserLanguage.startsWith(lang.lang));
    if (found) {return found.lang;}
  }
}

// eslint-disable-next-line complexity
function getDefaultDateFormat(): string {
  switch (navigator.language) {
    case 'ja': case 'ja-JP': case 'ko': case 'ko-KR': case 'zh': case 'zh-CN': case 'en-CA': case 'en-ZA':
      return 'yyyy-MM-dd';

    case 'zh-TW':
      return 'yyyy/MM/dd';

    case 'en-US':
      return 'MM/dd/yyyy';

    case 'es': case 'es-ES': case 'fr': case 'fr-FR': case 'pt': case 'pt-PT': case 'zh-SG':
      return 'dd/MM/yyyy';

    case 'ru': case 'ru-RU': case 'tr': case 'tr-TR': case 'en': case 'en-GB': case 'en-AU': case 'en-ZW': case 'en-NZ':
      return 'dd.MM.yyyy';

    default:
      return 'yyyy-MM-dd'; // ISO 8601 Date
  }
}

export const DEFAULT_SETTINGS: Settings = {
  selected: {
    map: {
      ltaKeys: undefined,
      pvcalcKeys: undefined
    },
    projectList: {
      ltaKeys: ['PVOUT_csi', 'GHI', 'DNI', 'DIF', 'GTI_opta', 'TEMP'],
      pvcalcKeys: ['PVOUT_specific', 'PVOUT_total', 'GTI', 'GHI', 'DNI', 'DIF', 'TEMP']
    },
    solarMeteoTable: ['GHI', 'DNI', 'DIF', 'D2G', 'GTI_opta', 'TEMP', 'WS', 'RH', 'PREC', 'PWAT', 'SNOWD', 'CDD', 'HDD', 'ALB']
  },
  toggle: {},
  translate: {
    lang: getDefaultLanguage()
  },
  geolocation: undefined,
  dateTimeFormat: {
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'HH:mm:ss'
  },
  pagination: {
    compareDialog: {
      pageSize: 20
    }
  },
  cookies: {
    accepted: false
  }
};

function cookiesReducer(state: CookiesSettings = DEFAULT_SETTINGS.cookies, action: SettingsActions.CookiesAction): CookiesSettings {
  switch (action.type) {
    case SettingsActions.SETTINGS_ACCEPT_COOKIES: {
      return { accepted: action.payload };
    }

    case SettingsActions.SETTINGS_INIT: {
      const cookiesSettings = action.payload.cookies;
      return isEqual(state, cookiesSettings) ? state : cookiesSettings;
    }

    default: {
      return state;
    }
  }
}

function toggleReducer(state: UnitToggleSettings = DEFAULT_SETTINGS.toggle, action: SettingsActions.ToggleActions): UnitToggleSettings {
  switch (action.type) {
    case SettingsActions.SETTINGS_TOGGLES: {
      const settings = action.payload.reduce((result, item) => {
        const { settingsKey, toggleKey } = item;
        result[settingsKey] = toggleKey;
        return result;
      }, {});
      return { ...state, ...settings };
    }

    case SettingsActions.SETTINGS_INIT: {
      const toggle = action.payload.toggle;
      return isEqual(state, toggle) ? state : toggle;
    }

    default: {
      return state;
    }
  }
}

function translateReducer(
  state: TranslateSettings = { lang: getDefaultLanguage() },
  action: SettingsActions.TranslateActions
): TranslateSettings {
  switch (action.type) {
    case SettingsActions.SETTINGS_TRANSLATE_LANG: {
      const lang = action.payload;
      return { lang };
    }

    case SettingsActions.SETTINGS_INIT: {
      const translateSettings = action.payload.translate as TranslateSettings;
      return translateSettings ? { ...state, ...translateSettings } : state;
    }

    default: {
      return state;
    }
  }
}

function selectedLayersReducer(
  state: SelectedLayers = DEFAULT_SETTINGS.selected,
  action: SettingsActions.SelectLayersActions
): SelectedLayers {
  switch (action.type) {
    case SettingsActions.SETTINGS_SELECT_MAP_DATA_KEYS: {
      const mapKeys = action.payload;
      return { ...state, map: mapKeys };
    }

    case SettingsActions.SETTINGS_SELECT_PROJECT_LIST_DATA_KEYS: {
      const projectKeys = action.payload;
      return { ...state, projectList: projectKeys };
    }

    case SettingsActions.SETTINGS_SELECT_SOLAR_METEO_TABLE_KEYS: {
      const solarMeteoTable = action.payload;
      return { ...state, solarMeteoTable };
    }

    case SettingsActions.SETTINGS_INIT: {
      const selected = action.payload.selected;
      return isEqual(state, selected) ? state : { ...state, ...selected };
    }

    default: {
      return state;
    }
  }
}

function geolocationReducer(state: IPGeolocation = null, action: SettingsActions.SettingsGeolocation): IPGeolocation {
  switch (action.type) {
    case SettingsActions.SETTINGS_GEOLOCATION: {
      return action.payload;
    }

    default: {
      return state;
    }
  }
}

function dateTimeFormatReducer(
  state: DateTimeSettings = { dateFormat: getDefaultDateFormat(), timeFormat: 'HH:mm:ss' },
  action: SettingsActions.DateTimeFormatActions
): DateTimeSettings {
  switch (action.type) {
    case SettingsActions.SETTINGS_DATE_FORMAT: {
      return action.payload;
    }

    case SettingsActions.SETTINGS_INIT: {
      const dateTimeFormat = action.payload.dateTimeFormat;
      return dateTimeFormat ? { ...state, ...dateTimeFormat } : state;
    }

    default: {
      return state;
    }
  }
}

function paginationReducer(
  state: PagesSettings = DEFAULT_SETTINGS.pagination,
  action: SettingsActions.CompareDialogPageSize
): PagesSettings {
  switch (action.type) {
    case SettingsActions.SETTINGS_COMPARE_DIALOG_PAGE_SIZE: {
      return { ...state, compareDialog: { pageSize: action.payload } };
    }

    case SettingsActions.SETTINGS_INIT: {
      const pageSettings = action.payload.pagination;
      return pageSettings && pageSettings.compareDialog && pageSettings.compareDialog.pageSize
        ? { ...state, ...pageSettings }
        : state;
    }

    default: {
      return state;
    }
  }
};

export const settingsReducer = combineReducers({
  selected: selectedLayersReducer,
  toggle: toggleReducer,
  translate: translateReducer,
  geolocation: geolocationReducer,
  dateTimeFormat: dateTimeFormatReducer,
  pagination: paginationReducer,
  cookies: cookiesReducer
});
