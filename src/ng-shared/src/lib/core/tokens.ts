import { InjectionToken } from '@angular/core';
import { ActionReducerMap } from '@ngrx/store';

import { AppLink } from 'ng-shared/core/types';

import { State } from './reducers';

export const APP_TOKEN = new InjectionToken<string>('SolargisApp');

export const HEADER_APPS_TOKEN = new InjectionToken<AppLink[]>('Embedded apps');

// in order to use combineReducers in any of root reducers
// https://github.com/ngrx/platform/blob/master/docs/store/api.md#injecting-reducers

export const REDUCER_TOKEN = new InjectionToken<ActionReducerMap<State>>(
  'Root Reducers'
);
