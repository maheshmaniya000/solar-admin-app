import { createSelector } from '@ngrx/store';

import { State } from '../reducers';
import { SortState } from '../reducers/sort.reducer';

export const sortSelectedFirst = createSelector(
  (state: State) => state.projectList.sort,
  (sort: SortState): boolean => (!!sort && sort.selectedFirst)
);
