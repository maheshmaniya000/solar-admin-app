import { createSelector, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { pipe } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { State } from '../reducers';
import { filteredProjectsSelector } from './filter.selector';

const getProjectListSelectedSingle = (state: State): string => state.projectList.selected.single;

const projectIdsSetSelector = createSelector(
  filteredProjectsSelector,
  getProjectListSelectedSingle,
  (projects, selected) => {
    const projectIds = projects.map(project => project._id);
    const markerIds = selected ? projectIds.concat(selected) : projectIds;
    return new Set(markerIds);
  }
);

export const selectProjectIds = pipe(
  select(projectIdsSetSelector),
  distinctUntilChanged((set1, set2) => isEqual(set1, set2)),
  map(markerIdsSet => Array.from(markerIdsSet))
);
