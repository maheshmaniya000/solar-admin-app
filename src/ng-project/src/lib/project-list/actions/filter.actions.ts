import { Action } from '@ngrx/store';

import { ProjectFilter, TagFilterState } from '../reducers/filter.reducer';

export const PROJECT_LIST_SET_FILTER = '[project list] set filter';
export const PROJECT_LIST_SET_TAG_FILTER = '[project list] set tag filter';
export const PROJECT_LIST_ADD_FILTER = '[project list] add filter';
export const PROJECT_LIST_CLEAR_FILTER = '[project list] clear filter';

export class SetFilter implements Action {
  readonly type = PROJECT_LIST_SET_FILTER;
  constructor(public payload: ProjectFilter) {}
}

export class SetTagFilter implements Action {
  readonly type = PROJECT_LIST_SET_TAG_FILTER;
  constructor(public payload: TagFilterState) {}
}

export class AddFilter implements Action {
  readonly type = PROJECT_LIST_ADD_FILTER;
  constructor(public payload: ProjectFilter) {}
}

export class ClearFilter implements Action {
  readonly type = PROJECT_LIST_CLEAR_FILTER;
}


export type Actions = SetFilter | AddFilter | ClearFilter | SetTagFilter;
