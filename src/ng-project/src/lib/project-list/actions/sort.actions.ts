import { Action } from '@ngrx/store';

import { SortState } from '../reducers/sort.reducer';

export const PROJECT_LIST_SORT = '[project list] sort';

export class Sort implements Action {
  readonly type = PROJECT_LIST_SORT;
  constructor(public payload: Partial<SortState>) {}
}

export type Actions = Sort;
