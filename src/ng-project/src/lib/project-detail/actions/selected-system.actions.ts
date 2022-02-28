import { Action } from '@ngrx/store';

import { EnergySystemRef } from '@solargis/types/project';

export const PROJECT_DETAIL_SELECT_SYSTEM = '[project detail] select system';

export const PROJECT_DETAIL_CLEAR_SYSTEM = '[project detail] clear system';

export class SelectSystem implements Action {
  readonly type = PROJECT_DETAIL_SELECT_SYSTEM;
  constructor(public payload: EnergySystemRef) {}
}

export class ClearSystem implements Action {
  readonly type = PROJECT_DETAIL_CLEAR_SYSTEM;
}

export type Actions = SelectSystem | ClearSystem;
