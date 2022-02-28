import { createSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { State } from '../reducers';

const tagSelector = createSelector((state: State) => state.project, project => project.userTags);

export const selectUserTags = pipe(
  select(tagSelector),
  distinctUntilChanged()
);
