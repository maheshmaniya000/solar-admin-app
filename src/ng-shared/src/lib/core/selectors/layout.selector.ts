import { select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { State } from '../reducers';
import { LayoutState } from '../reducers/layout.reducer';

const layoutProjectListSelector = (state: State): LayoutState['projectList'] => state.layout.projectList;

export const selectLayoutProjectListDataTab = pipe(
  select(layoutProjectListSelector),
  map(({ dataTab }) => dataTab)
);

export const selectLayoutProjectListSidebar = pipe(
  select(layoutProjectListSelector),
  map(({ sidebar }) => sidebar)
);
