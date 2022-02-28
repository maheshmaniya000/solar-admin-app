import { Action } from '@ngrx/store';

import { DateTimeSettings } from '@solargis/types/user-company';

import { IPGeolocation, Settings, SolarMeteoTableSettings } from '../types';

export const SETTINGS_ACCEPT_COOKIES = '[settings] accept cookies';
export const SETTINGS_COMPARE_DIALOG_PAGE_SIZE = '[settings] compare dialog page size';
export const SETTINGS_DATE_FORMAT = '[settings] date format';
export const SETTINGS_GEOLOCATION = '[settings] geolocation';
export const SETTINGS_INIT = '[settings] init';
export const SETTINGS_LAYOUT = '[settings] layout';
export const SETTINGS_SELECT_MAP_DATA_KEYS = '[settings] select map dataKeys';
export const SETTINGS_SELECT_PROJECT_LIST_DATA_KEYS = '[settings] select project list dataKeys';
export const SETTINGS_SELECT_SOLAR_METEO_TABLE_KEYS = '[settings] select solar meteo table keys';
export const SETTINGS_TOGGLES = '[settings] toggles';
export const SETTINGS_TRANSLATE_LANG = '[settings] translate lang';

export class SettingsInit implements Action {
  readonly type = SETTINGS_INIT;
  constructor(public payload: Settings) {}
}

export class SettingsSelectProjectListDataKeys implements Action {
  readonly type = SETTINGS_SELECT_PROJECT_LIST_DATA_KEYS;
  constructor(public payload: { ltaKeys: string[]; pvcalcKeys: string[] }) {}
}

export class SettingsSelectMapDataKeys implements Action {
  readonly type = SETTINGS_SELECT_MAP_DATA_KEYS;
  constructor(public payload: {ltaKeys: string[]; pvcalcKeys: string[]}) {}
}

export class SettingsToggles implements Action {
  readonly type = SETTINGS_TOGGLES;
  constructor(public payload: [{ settingsKey: string; toggleKey: string }], public save: boolean = true) {}
}

export class SettingsTranslateLang implements Action {
  readonly type = SETTINGS_TRANSLATE_LANG;
  constructor(public payload: string, public save: boolean = true) {}
}

export class SettingsGeolocation implements Action {
  readonly type = SETTINGS_GEOLOCATION;
  constructor(public payload: IPGeolocation) {}
}

export class SettingsDateTimeFormat implements Action {
  readonly type = SETTINGS_DATE_FORMAT;
  constructor(public payload: DateTimeSettings, public save: boolean = true) {}
}

// FIXME we will have to refactore entire settings state and actions,
//  there is no reason to have specific columns of all tables and other specific settings in the generic core module

export class SettingsCompareDialogPageSize implements Action {
  readonly type = SETTINGS_COMPARE_DIALOG_PAGE_SIZE;
  constructor(public payload: number) {}
}

export class SettingsAcceptCookies implements Action {
  readonly type = SETTINGS_ACCEPT_COOKIES;
  constructor(public payload: boolean) {}
}

export class SettingsSelectSolarMeteoTableKeys implements Action {
  readonly type = SETTINGS_SELECT_SOLAR_METEO_TABLE_KEYS;
  constructor(public payload: SolarMeteoTableSettings) {}
}

export type SelectLayersActions = SettingsInit
  | SettingsSelectMapDataKeys
  | SettingsSelectProjectListDataKeys
  | SettingsSelectSolarMeteoTableKeys;

export type ToggleActions = SettingsInit | SettingsToggles;
export type TranslateActions = SettingsInit | SettingsTranslateLang;
export type GeolocationActions = SettingsGeolocation;
export type DateTimeFormatActions = SettingsInit | SettingsDateTimeFormat;
export type CompareDialogPageSize = SettingsInit | SettingsCompareDialogPageSize;
export type CookiesAction = SettingsInit | SettingsAcceptCookies;

export type Actions = SelectLayersActions | ToggleActions | TranslateActions | GeolocationActions;
