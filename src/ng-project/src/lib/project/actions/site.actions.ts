import { Action } from '@ngrx/store';

import { LatLng, SiteExpression } from '@solargis/types/site';

import { IPGeolocation } from 'ng-shared/core/types';

export const SITE_FROM_URL = '[site] from url';
export const SITE_FROM_MAP = '[site] from map';
export const SITE_FROM_SEARCH = '[site] from search';
export const SITE_FROM_IPLOCATION = '[site] from iplocation';
export const SITE_FROM_GEOLOCATION = '[site] from geolocation';

export class SiteExpressionAction {
  constructor(public payload: SiteExpression) {}
}

export class SiteFromUrl implements Action {
  readonly type = SITE_FROM_URL;
  constructor(public payload: LatLng) {}
}

export class SiteFromMap extends SiteExpressionAction implements Action {
  readonly type = SITE_FROM_MAP;
}

export class SiteFromSearch extends SiteExpressionAction implements Action {
  readonly type = SITE_FROM_SEARCH;
}

export class SiteFromIPlocation implements Action {
  readonly type = SITE_FROM_IPLOCATION;
  constructor(public payload: IPGeolocation) {}
}

export class SiteFromGeolocation implements Action {
  readonly type = SITE_FROM_GEOLOCATION;
  constructor(public payload: GeolocationPosition) {}
}

export type Actions = SiteFromUrl | SiteFromMap | SiteFromSearch | SiteFromIPlocation | SiteFromGeolocation;
