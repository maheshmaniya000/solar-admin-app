import { Params } from '@angular/router';
import { Action } from '@ngrx/store';

export const URL_PARAMS_INIT = '[url params] init';
export const URL_PARAMS_POP_STATE = '[url params] pop state';
export const URL_PARAMS_SYNC = '[url params] sync';

export abstract class UrlParamsAction implements Action {
  abstract type: string;
  constructor(public payload: Params) {}
}

export class UrlParamsInit extends UrlParamsAction {
  readonly type = URL_PARAMS_INIT;
}

export class UrlParamsPopState extends UrlParamsAction {
  readonly type = URL_PARAMS_POP_STATE;
}

export class UrlParamsSync extends UrlParamsAction {
  readonly type = URL_PARAMS_SYNC;
}

export type Actions = UrlParamsInit | UrlParamsPopState | UrlParamsSync;
