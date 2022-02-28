import { Site } from '@solargis/types/site';
import { ensureArray } from '@solargis/types/utils';

import {
  Actions, SEARCH_ADD_TO_HISTORY, SEARCH_CLEAR_HIGHLIGHT, SEARCH_CLEAR_RESULTS, SEARCH_HIGHLIGHT, SEARCH_RESULTS, SEARCH_TOGGLE
} from '../actions/search.actions';

export type SearchState = {
  results?: Site[];
  highlightIndex?: number;
  history?: string[];
  showSearch: boolean;
};

const DEFAULT_SETTINGS: SearchState = {
  showSearch: false
};

export function siteSearchReducer(state: SearchState = DEFAULT_SETTINGS, action: Actions): SearchState {
  switch (action.type) {
    case SEARCH_RESULTS: {
      const results: Site[] = action.payload;
      return { ...state, results };
    }

    case SEARCH_CLEAR_RESULTS: {
      return { ...state, results: undefined };
    }

    case SEARCH_HIGHLIGHT: {
      const highlightIndex: number = action.payload;
      return { ...state, highlightIndex };
    }

    case SEARCH_CLEAR_HIGHLIGHT: {
      return { ...state, highlightIndex: undefined };
    }

    case SEARCH_ADD_TO_HISTORY: {
      const history = ensureArray(action.payload || []);
      const stateHistory = state && state.history ? state.history : [];
      const newHistory = [...history, ...stateHistory.filter(item => history.indexOf(item) === -1)];
      return { ...state, history: newHistory.slice(0, 5)};
    }

    case SEARCH_TOGGLE: {
      const showSearch = action.payload || false;
      return { ...state, showSearch };
    }
  }
  return state;
}
