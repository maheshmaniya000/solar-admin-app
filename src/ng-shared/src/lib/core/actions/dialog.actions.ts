import { Action } from '@ngrx/store';

import { EnergySystemRef, Project } from '@solargis/types/project';

export const OPEN_CONTENT_LOCKED_DIALOG = '[content locked dialog] open';
export const OPEN_REQUEST_TRIAL_DIALOG = '[request trial dialog] open';
export const OPEN_ACTIVATE_FREE_TRIAL_DIALOG = '[activate free trial dialog]  open';
export const OPEN_UPDATE_PROJECT_DATA_DIALOG = '[update project data dialog] open';

export class OpenContentLockedDialog implements Action {
  readonly type = OPEN_CONTENT_LOCKED_DIALOG;
  constructor(public payload: string) {}
}

export class OpenRequestTrialDialog implements Action {
  readonly type = OPEN_REQUEST_TRIAL_DIALOG;
}

export class OpenActivateFreeTrialDialog implements Action {
  readonly type = OPEN_ACTIVATE_FREE_TRIAL_DIALOG;
  constructor(public payload: Project) {}
}

export class OpenUpdateProjectDataDialog implements Action {
  readonly type = OPEN_UPDATE_PROJECT_DATA_DIALOG;
  constructor(public payload: EnergySystemRef) {}
}

export type Actions = OpenContentLockedDialog | OpenRequestTrialDialog | OpenActivateFreeTrialDialog | OpenUpdateProjectDataDialog;
