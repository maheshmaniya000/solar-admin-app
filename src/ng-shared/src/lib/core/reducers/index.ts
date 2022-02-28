import { Data, Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';

import { Settings } from '../types';
import { alertsReducer, AlertsState } from './alerts.reducer';
import { reducers as configReducer, ConfigState } from './config.reducer';
import { headerReducer, HeaderState } from './header.reducer';
import { layoutReducer, LayoutState } from './layout.reducer';
import { routeDataReducer } from './route-data.reducer';
import { settingsReducer } from './settings.reducer';
import { urlParamsReducer } from './url-params.reducer';

export interface State {
  header: HeaderState;
  routeData: Data;
  routerReducer: RouterReducerState;
  settings: Settings;
  urlParams: Params;
  layout: LayoutState;
  alerts: AlertsState;
  config: ConfigState;
}

export const reducers: ActionReducerMap<State> = {
  header: headerReducer,
  routeData: routeDataReducer, // current activated route data
  routerReducer,
  settings: settingsReducer,
  urlParams: urlParamsReducer,
  layout: layoutReducer,
  alerts: alertsReducer,
  config: configReducer
};

export function getReducers(): ActionReducerMap<State> {
  return reducers;
}
