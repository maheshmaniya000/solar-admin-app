import { Injectable } from '@angular/core';

import { DataLayerDef } from '@solargis/dataset-core';
import { MapLayerDef, MapSelectedLayers } from '@solargis/types/map';
import { SolargisApp } from '@solargis/types/user-company';

export type AmplitudeAnalyticsConfig = {
  key: string;
};

export type LambdaApiConfig = {
  baseUrl: string;
  customerUrl: string;
  projectUrl: string;
  prospectUrl: string;
  userTagUrl: string;
};

export type AppConfig = { url: string; devUrl?: string };

export type Auth0Config = {
  customNamespace: string;
  passwordMatchRegexp: string;
};

export type GoogleAnalyticsConfig = {
  linkerAutolink?: string[];
  trackingId: string;
};

export type GeolocatorConfig = {
  enabled: boolean;
  fallback: string;
};

export type ApiConfig = {
  key: string;
  url: string;
};

export type RecaptchaConfig = {
  publicKey: string;
};

export type SentryConfig = {
  dsn: string;
  release: string;
};

// Maps to @solargis/ng-geosearch#GeocoderConfig
// Only geocoder API keys -> we can turn off/on geocoders with .env
export type GeocoderKeysConfig = {
  nominatim?: boolean;
  opencage?: string;
};

export type DataConfig = {
  defaultLayerKey: string;
  ltaLayers: DataLayerDef[];
  pvcalcLayers: DataLayerDef[];
};

export type MapConfig = {
  center: string;
  layers: MapLayerDef[];
  selected: MapSelectedLayers;
};

export type ReportConfig = {
  assetsUrl: string;
};

// http://plnkr.co/edit/87k3AQbBZXV5c7lcKFRS

@Injectable()
export class Config {
  amplitude?: AmplitudeAnalyticsConfig;
  api: LambdaApiConfig;
  apps: { [app: string]: AppConfig };
  auth0: Auth0Config;
  env: string;
  ga?: GoogleAnalyticsConfig;
  geolocator: GeolocatorConfig;
  ip?: string;
  ipstack: ApiConfig;
  languages: string[];
  recaptcha: RecaptchaConfig;
  sentry?: SentryConfig;
  geocoder?: GeocoderKeysConfig;
  version: string;
  sdatDownloadUrl?: string;
}

@Injectable()
export class AdminAppConfig extends Config {

}

export interface HasMapAndDataConfig {
  data: DataConfig;
  map: MapConfig;
}

export interface HasReportConfig {
  report: ReportConfig;
}

@Injectable()
export class ProspectAppConfig extends Config implements HasMapAndDataConfig, HasReportConfig {
  data: DataConfig;
  map: MapConfig;
  report: ReportConfig;
  timezonedb: ApiConfig;
}

@Injectable()
export class EvaluateAppConfig extends Config {
  // TODO add evaluate specific config
  // TOTO refactor shared config between prospect and evaluate, e.g. map, timezonedb
}

@Injectable()
export class DashboardAppConfig extends Config {
  // TODO add dashboard specific config
  map: MapConfig;
}

@Injectable()
export class PrintAppConfig extends Config implements HasReportConfig {
  report: ReportConfig;
}

// https://github.com/angular/angular/issues/23279#issuecomment-539435523

export async function fetchConfig(
  app: 'admin' | 'print' | 'dashboard' | SolargisApp
): Promise<Config> {
  const res = await fetch(`/api/config/${app}`);
  return (await res.json()) as Config;
}
