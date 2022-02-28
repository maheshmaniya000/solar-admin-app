import { Action } from '@ngrx/store';

import { EnergySystemRef } from '@solargis/types/project';


// API actions
export const COMPARE_ADD_PROJECT = '[compare] add project';
export const COMPARE_ADD_PROJECT_AFTER_CHECKED = '[compare] add project after check';
export const COMPARE_SHOW_REPLACE_DIALOG = '[compare] show replace dialog';
export const COMPARE_SHOW_PROJECT_LIST = '[compare] show project list';
export const COMPARE_REMOVE_PROJECT = '[compare] remove project';
export const COMPARE_BULK_EDIT = '[compare] bulk edit';
export const COMPARE_CLEAR = '[compare] clear';
export const COMPARE_HIGHLIGHT = '[compare] highlight';

type CompareEnergySystemRef = EnergySystemRef & { highlighted?: boolean };

export class CompareAddProjectRequest implements Action {
  readonly type = COMPARE_ADD_PROJECT;
  constructor(public payload: EnergySystemRef) {}
}

export class CompareAddProjectAfterChecked implements Action {
  readonly type = COMPARE_ADD_PROJECT_AFTER_CHECKED;
  constructor(public payload: EnergySystemRef) {}
}

export class CompareShowProjectList implements Action {
  readonly type = COMPARE_SHOW_PROJECT_LIST;
  constructor(public payload?: EnergySystemRef) {}
}

export class CompareShowReplaceDialog implements Action {
  readonly type = COMPARE_SHOW_REPLACE_DIALOG;
  constructor(public payload: EnergySystemRef) {}
}

export class CompareRemoveProject implements Action {
  readonly type = COMPARE_REMOVE_PROJECT;
  constructor(public payload: EnergySystemRef) {}
}

export class CompareBulkEdit implements Action {
  readonly type = COMPARE_BULK_EDIT;
  constructor(
    public payload: {
      toAdd?: EnergySystemRef[];
      toRemove?: EnergySystemRef[];
      clearAll?: boolean;
      skipAnalytics?: boolean;
    }
  ) {}
}

export class CompareClear implements Action {
  readonly type = COMPARE_CLEAR;
}

export class CompareHighlight implements Action {
  readonly type = COMPARE_HIGHLIGHT;
  constructor(public payload: CompareEnergySystemRef) {}
}

export type Actions =
  CompareAddProjectRequest |
  CompareAddProjectAfterChecked |
  CompareShowReplaceDialog |
  CompareShowProjectList |
  CompareRemoveProject |
  CompareBulkEdit |
  CompareClear |
  CompareHighlight;
