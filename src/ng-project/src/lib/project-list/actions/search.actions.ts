import { Action } from '@ngrx/store';

import { Site } from '@solargis/types/site';

export const SEARCH_RESULTS = '[search] results';
export const SEARCH_HIGHLIGHT = '[search] highlight';
export const SEARCH_CLEAR_RESULTS = '[search] clear results';
export const SEARCH_CLEAR_HIGHLIGHT = '[search] clear highlight';
export const SEARCH_ADD_TO_HISTORY = '[search] add to history';
export const SEARCH_TOGGLE = '[search] search open toggle';

export class SearchResults implements Action {
  readonly type = SEARCH_RESULTS;
  constructor(public payload: Site[]) {}
}

export class SearchHighlight implements Action {
  readonly type = SEARCH_HIGHLIGHT;
  constructor(public payload: number /* highlightIndex */) {}
}

export class SearchClearResults implements Action {
  readonly type = SEARCH_CLEAR_RESULTS;
}

export class SearchClearHighlight implements Action {
  readonly type = SEARCH_CLEAR_HIGHLIGHT;
}

export class SearchAddToHistory implements Action {
  readonly type = SEARCH_ADD_TO_HISTORY;
  constructor(public payload: (string | string[])) {}
}

export class SearchToggle implements Action {
  readonly type = SEARCH_TOGGLE;
  constructor(public payload: boolean) {}
}

export type Actions = SearchResults | SearchHighlight | SearchClearResults | SearchClearHighlight | SearchAddToHistory | SearchToggle;
