import assert from 'assert';
import * as fs from 'fs';
import { cwd } from 'process';

import { mapValues } from 'lodash-es';
import * as properties from 'properties';

import { NcbinReaderOpts } from '@solargis/prospect-service';
import { removeEmpty } from '@solargis/types/utils';

import { ApiConfig, LambdaApiConfig, ReportConfig } from 'ng-shared/config';
import { FUPOpts, RecaptchaOptions } from 'ng-shared/user/types';

import { environment } from './environments/environment';
import { FUPLogger } from './service/fup/fup-logger';
import { DBLogger } from './util/loggers/db-logger';

function removeQuotes(val: any): string {
  return typeof val === 'string' ? val.replace(/^'(.+)'$/, '$1') : val;
}

function parseBoolean(v: any): boolean {
  return v === 'True' || v === 'true' || v === '1' || v === true;
}

if (process.env.ENV_PROPERTIES) {
  console.log(
    `Reading env properties from file: ${process.env.ENV_PROPERTIES}`
  );
  const propsStr = fs.readFileSync(process.env.ENV_PROPERTIES).toString();
  try {
    let propsObj = properties.parse(propsStr, {});
    propsObj = mapValues(propsObj, removeQuotes);
    Object.assign(process.env, propsObj);
  } catch (error) {
    console.error(error);
  }
}

assert(process.env.SDAT_DOWNLOAD_URL, 'SDAT_DOWNLOAD_URL is required');
export const sdatDownloadUrl = process.env.SDAT_DOWNLOAD_URL;

assert(process.env.ENV, 'ENV is required');
export const env = process.env.ENV;

assert(process.env.BASE_URL, 'BASE_URL is required');

export const baseUrl = process.env.BASE_URL;
export const ensureBaseUrl = parseBoolean(process.env.ENSURE_BASE_URL || false);

export const appsConfig = {
  admin: removeEmpty({
    url: process.env.BASE_ADMIN_URL || '/admin',
    dev: { proxyUrl: !environment.production && 'http://localhost:3000' },
    prod: true
  }),
  prospect: removeEmpty({
    url: process.env.BASE_PROSPECT_URL || '/prospect',
    dev: { proxyUrl: !environment.production && 'http://localhost:3001' },
    prod: true
  }),
  evaluate: removeEmpty({
    url: process.env.BASE_EVALUATE_URL || '/evaluate',
    dev: { proxyUrl: !environment.production && 'http://localhost:3002' },
    prod: false
  }),
  print: removeEmpty({
    url: process.env.BASE_PRINT_URL || '/print',
    dev: { proxyUrl: !environment.production && 'http://localhost:3003' },
    prod: true
  }),
  dashboard: removeEmpty({
    url: process.env.BASE_DASHBOARD_URL || '/dashboard',
    dev: { proxyUrl: !environment.production && 'http://localhost:3004' },
    prod: true
  })
};

assert(process.env.AWS_ACCESS_KEY_ID, 'AWS_ACCESS_KEY_ID is required');
assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS_SECRED_ACCESS_KEY is required');
assert(process.env.AWS_DEFAULT_REGION, 'AWS_DEFAULT_REGION is required');

export const awsOpts = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION
};

assert(process.env.AUTH0_CLIENT_ID, 'AUTH0_CLIENT_ID is required');

export const auth0Opts = {
  clientId: process.env.AUTH0_CLIENT_ID,
  customNamespace: process.env.AUTH0_CUSTOM_NAMESPACE || 'https://solargis.com',
  passwordMatchRegexp: '^(?=.*[a-z])(?=.*[A-Z]).{8,}$'
};

assert(
  process.env.AUTH0_API_MANAGEMENT_URL,
  'AUTH0_API_MANAGEMENT_URL is required'
);

export const auth0ManagementOpts = {
  url: process.env.AUTH0_API_MANAGEMENT_URL
};

assert(process.env.RECAPTCHA_PUBLIC_KEY, 'RECAPTCHA_PUBLIC_KEY is required');
assert(process.env.RECAPTCHA_SECRET_KEY, 'RECAPTCHA_SECRET_KEY is required');

export const recaptchaOpts: RecaptchaOptions = {
  publicKey: process.env.RECAPTCHA_PUBLIC_KEY,
  secretKey: process.env.RECAPTCHA_SECRET_KEY,
  androidPublicKey: process.env.RECAPTCHA_ANDROID_PUBLIC_KEY,
  androidSecretKey: process.env.RECAPTCHA_ANDROID_SECRET_KEY
};

export const fupOpts: FUPOpts = {
  level:
    process.env.LOG_FUP_LEVEL != null
      ? process.env.LOG_FUP_LEVEL
      : FUPLogger.OFF
};

export const LOG_DB_LEVEL =
  process.env.LOG_DB_LEVEL != null ? process.env.LOG_DB_LEVEL : DBLogger.OFF;


assert(process.env.DYNAMODB_URI, 'DYNAMODB_URI is required');

export const dynamoOpts = {
  uri: process.env.DYNAMODB_URI,
  region: awsOpts.region,
  tablePrefix: process.env.DYNAMODB_PREFIX || 'dev',
  localDir: cwd()
};

// export const ncbinAutoReload = parseBoolean(process.env.NCBIN_AUTO_RELOAD);

assert(process.env.MAPDATA_BASE_URI, 'MAPDATA_BASE_URI is required');

export const ltaNcbinOpts: NcbinReaderOpts = {
  ...awsOpts,
  region: (process.env.NCBIN_REGION || awsOpts.region) as string,
  headersTable: process.env.NCBIN_HEADERS_TABLE || 'ncbin-headers-prod',
  baseUri: process.env.MAPDATA_BASE_URI as string,
  // hardcoded for now, we can add it to env if needed
  layersToInit: ['MAPDATA', 'TERRAIN_AZIM', 'TERRAIN_ELEVBATHY', 'TERRAIN_SLOPE']
};

assert(process.env.API_BASE, 'API_BASE is required');

export const apiConfig: LambdaApiConfig = removeEmpty({
  baseUrl: process.env.API_BASE as string,
  customerUrl: process.env.API_BASE_CUSTOMER || process.env.API_BASE + '/customer',
  projectUrl: process.env.API_BASE_PROJECT || process.env.API_BASE + '/project',
  prospectUrl: process.env.API_BASE_PROSPECT || process.env.API_BASE + '/prospect',
  userTagUrl: process.env.API_BASE_USER_TAG || process.env.API_BASE + '/user-tag'
});

assert(process.env.IPSTACK_KEY, 'IPSTACK_KEY is required');

export const ipstackConfig: ApiConfig = {
  key: process.env.IPSTACK_KEY,
  url: process.env.IPSTACK_URL || 'http://api.ipstack.com'
};

assert(process.env.TIMEZONEDB_KEY, 'TIMEZONEDB_KEY is required');

export const timezonedbConfig: ApiConfig = {
  key: process.env.TIMEZONEDB_KEY,
  url: process.env.TIMEZONEDB_URL || 'https://api.timezonedb.com/v2'
};

export const reportConfig: ReportConfig = {
  assetsUrl: process.env.S3_REPORT_ASSETS_URL || '//public.solargis.com/report_assets'
};

export const ipBlacklist = removeEmpty(
  {
    ips: (process.env.IP_BLACKLIST_IPS || '').split(/[ ,]/g),
    regex: process.env.IP_BLACKLIST_REGEX
      ? new RegExp(process.env.IP_BLACKLIST_REGEX)
      : undefined,
    timeout: parseInt(process.env.IP_BLACKLIST_TIMEOUT || '25000', 10)
  },
  false
);

// Svg captcha .env params are optional

// assert(process.env.LAMBDA_CAPTCHA_SIGNATURE_KEY, 'LAMBDA_CAPTCHA_SIGNATURE_KEY is required');
// assert(process.env.LAMBDA_CAPTCHA_SECRET_KEY, 'LAMBDA_CAPTCHA_SECRET_KEY is required');

export const lambdaCaptchaOpts = {
  signatureKey: process.env.LAMBDA_CAPTCHA_SIGNATURE_KEY,
  secretKey: process.env.LAMBDA_CAPTCHA_SECRET_KEY
};

// example ALLOWED_LANGUAGES=en,es,ko
// ALLOWED_LANGUAGES=null to allow all langs
export const allowedLanguages = process.env.ALLOWED_LANGUAGES
  ? process.env.ALLOWED_LANGUAGES.split(',')
  : null;
