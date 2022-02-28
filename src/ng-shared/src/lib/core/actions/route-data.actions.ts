import { Data } from '@angular/router';
import { Action } from '@ngrx/store';

export const ROUTE_DATA_CHANGED = '[route data] changed';

export class RouteDataChanged implements Action {
  readonly type = ROUTE_DATA_CHANGED;
  constructor(public payload: Data) {}
}

export type Actions = RouteDataChanged;
