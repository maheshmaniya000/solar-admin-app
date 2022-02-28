import { Action } from '@ngrx/store';

import { ProjectId } from '@solargis/types/project';
import { LatLng } from '@solargis/types/site';
import { DateTimeSettings } from '@solargis/types/user-company';
import { UnitToggleSettings } from '@solargis/units';


export type AppLink = {
  app: string;
  appUrl?: string;
  routerLink?: string;
};

export type Language = {
  lang: string;
  name: string;
  inReport: boolean;
  braintreeLocale: string;
};

export type DateFormat = {
  format: string;
  label: string;
};

export type TranslateSettings = {
  lang: string;
};

export type SelectedSettings = {
  ltaKeys: string[];
  pvcalcKeys: string[];
};

export type PagesSettings = {
  compareDialog: {
    pageSize: number;
  };
};

export type CookiesSettings = {
  accepted: boolean;
};

export type SolarMeteoTableSettings = string[];

export type IPGeolocation = {
  point: LatLng;
  provider: 'ipstack' | 'fallback';
  countryCode?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  raw_response?: any;
};

export type SelectedLayers = {
  map: SelectedSettings;
  projectList: SelectedSettings;
  solarMeteoTable: SolarMeteoTableSettings;
};

export type Settings = {
  selected: SelectedLayers;
  toggle: UnitToggleSettings;     // TODO rename to unitsToggle
  translate: TranslateSettings;
  geolocation: IPGeolocation;
  dateTimeFormat: DateTimeSettings;
  pagination: PagesSettings;
  cookies: CookiesSettings;
};

export type AlertSeverity = 'info' | 'warning';

export type AlertRoute = 'prospect/map' | 'prospect/list' | 'prospect/compare' | 'prospect/detail';

export type AlertClickAction = {
  text: string;
  href?: string;
  clickFn?: () => void;
  dispatchOnClick?: Action;
  closeAlertOnClick?: boolean;
};

export type AlertWithoutID = {
  /** On which pages to display this alert? If not specified, select all */
  routes?: AlertRoute[];

  severity: AlertSeverity;
  text: string;
  highlightedText?: string;
  click?: AlertClickAction;
  secondaryClick?: AlertClickAction;
  closeClick?: AlertClickAction;
  projectId?: ProjectId;
};

export type Alert = AlertWithoutID & {
  /** Internal alert ID */
  id?: string;
};

export function createAlert(alert: AlertWithoutID): Alert {
  return {
    id: `${Date.now()}-${Math.random()}`,
    ...alert,
  };
}

export type HeaderTabLink = {
  label: string;
  link: string;
  icon: string;
};
