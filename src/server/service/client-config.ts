import { removeEmpty } from '@solargis/types/utils';

import {
  AdminAppConfig,
  AmplitudeAnalyticsConfig,
  Auth0Config,
  Config,
  DashboardAppConfig,
  DataConfig,
  EvaluateAppConfig,
  GeocoderKeysConfig,
  GeolocatorConfig,
  GoogleAnalyticsConfig,
  MapConfig,
  PrintAppConfig,
  ProspectAppConfig,
  SentryConfig
} from 'ng-shared/config';

import { version } from '../../../package.json';
import {
  allowedLanguages, apiConfig, appsConfig, auth0Opts, env, ipstackConfig, recaptchaOpts, reportConfig, timezonedbConfig, sdatDownloadUrl
} from '../env';
import { ltaLayerDefs, pvcalcLayerDefs } from '../models/prospect-config';
import { MapLayersService } from './map-layers';

const mapLayersService = new MapLayersService();

function amplitudeConfig(): AmplitudeAnalyticsConfig {
  return process.env.AMPLITUDE_KEY && { key: process.env.AMPLITUDE_KEY };
}

function auth0Config(): Auth0Config {
  const { customNamespace, passwordMatchRegexp } = auth0Opts;
  return {
    customNamespace,
    passwordMatchRegexp
  };
}

function gaConfig(): GoogleAnalyticsConfig {
  return process.env.GA_TRACKING_ID
    ? removeEmpty({
        linkerAutolink: process.env.GA_LINKER_AUTOLINK
          ? process.env.GA_LINKER_AUTOLINK.split(',')
          : undefined,
        trackingId: process.env.GA_TRACKING_ID
      })
    : undefined;
}

function geolocatorConfig(): GeolocatorConfig {
  return {
    enabled: typeof process.env.GEOLOCATOR_ENABLED !== 'undefined'
      ? process.env.GEOLOCATOR_ENABLED.toLowerCase() === 'true'
      : true,
    fallback: process.env.GEOLOCATOR_FALLBACK || '48.156267,17.118673' // blumental offices
  };
}

function sentryConfig(): SentryConfig {
  return process.env.SENTRY_DSN
    ? {
        dsn: process.env.SENTRY_DSN,
        // https://devcenter.heroku.com/changelog-items/630
        release: process.env.SOURCE_VERSION
      }
    : undefined;
}

function geocoderConfig(): GeocoderKeysConfig {
  const config: GeocoderKeysConfig = {};
  if (process.env.NOMINATIM_ENABLED && process.env.NOMINATIM_ENABLED !== 'false') { config.nominatim = true; };
  if (process.env.OPENCAGE_KEY) { config.opencage = process.env.OPENCAGE_KEY; };
  return config;
}

async function mapConfigPromise(): Promise<MapConfig> {
  const mapLayers = await mapLayersService.mapLayers();
  return {
    center: process.env.MAP_CENTER || '11.523088,8.261719,3', // lat,lng,zoom
    layers: mapLayers,
    selected: {
      labels: (process.env.MAP_LABELS || 'true').toLowerCase() === 'true',
      layerId: process.env.MAP_ID || 'solargis-pvout_csi',
    }
    // TODO ensure layers contain selected.layerId
  };
}

function dataConfig(): DataConfig {
  return {
    defaultLayerKey: process.env.DATA_DEFAULT_LAYER_KEY || 'PVOUT_csi',
    ltaLayers: ltaLayerDefs,
    pvcalcLayers: pvcalcLayerDefs
  };
}

export async function getClientConfig(
  app: 'admin' | 'prospect' | 'evaluate' | 'print' | 'dashboard',
  clientIp: string
): Promise<AdminAppConfig | ProspectAppConfig | PrintAppConfig | EvaluateAppConfig | DashboardAppConfig> {
  const baseConfig: Config = removeEmpty({
    amplitude: amplitudeConfig(),
    api: apiConfig,
    apps: appsConfig,
    auth0: auth0Config(),
    env,
    ga: gaConfig(),
    geolocator: geolocatorConfig(),
    ip: clientIp,
    ipstack: ipstackConfig,
    languages: allowedLanguages,
    recaptcha: { publicKey: recaptchaOpts.publicKey },
    sentry: sentryConfig(),
    version
  }, false);
  switch (app) {
    case 'admin': {
      return {
        ...baseConfig,
        geolocator: { ...geolocatorConfig(), enabled: false }
      };
    }
    case 'prospect': {
      const prospectMapConfig = await mapConfigPromise();
      return {
        ...baseConfig,
        data: dataConfig(),
        map: prospectMapConfig,
        report: reportConfig,
        timezonedb: timezonedbConfig,
        geocoder: geocoderConfig(),
      };
    }
    case 'evaluate': {
      return {
        // TODO add evaluate-specific config and refactor shared
        ...baseConfig
      };
    }
    case 'print': {
      return {
        ...baseConfig,
        report: reportConfig,
        geocoder: geocoderConfig(),
      };
    }
    case 'dashboard': {
      const dashoboardMapConfig = await mapConfigPromise();
      return {
        ...baseConfig,
        data: dataConfig(),
        map: dashoboardMapConfig, // recent projects in cards view with a map,
        sdatDownloadUrl
      };
    }
    default:
      throw new Error(`missing config for app: ${app}`);
  }
}
