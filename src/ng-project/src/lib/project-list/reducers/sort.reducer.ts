import { Sort as MaterialSort } from '@angular/material/sort';

import { Actions, PROJECT_LIST_SORT } from '../actions/sort.actions';

export type SortState = MaterialSort & {
  selectedFirst?: boolean; // TODO move to filter.reducer / state
};

const defaultSortState: SortState = {
  selectedFirst: false,
  active: '',
  direction: 'asc'
};

export function sortReducer(state: SortState = defaultSortState, action: Actions): SortState {
  switch (action.type) {
    case PROJECT_LIST_SORT:
      return { ...state, ...action.payload };
  }
  return state;
}
