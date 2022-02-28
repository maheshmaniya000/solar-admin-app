import { Action } from '@ngrx/store';

import { PvConfig } from '@solargis/types/pv-config';

export const PV_CONFIG_SET_DRAFT = '[pv config] set draft';
export const PV_CONFIG_CLEAR_DRAFT = '[pv config] clear draft';
export const PV_CONFIG_SAVE = '[pv config] save';

export class SetDraft implements Action {
  readonly type = PV_CONFIG_SET_DRAFT;
  constructor(public payload: PvConfig) {}
}

export class ClearDraft implements Action {
  readonly type = PV_CONFIG_CLEAR_DRAFT;
}

export class Save implements Action {
  readonly type = PV_CONFIG_SAVE;
  constructor(public payload: PvConfig) {}
}

export type Actions = SetDraft | ClearDraft | Save;
