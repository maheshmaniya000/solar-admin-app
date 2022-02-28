import { createSelector, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { pipe } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { getProjectDefaultSystem } from '@solargis/types/project';

import { SetFilter } from 'ng-project/project-list/actions/filter.actions';
import { getRecentFilter } from 'ng-project/project-list/reducers/filter.reducer';
import { filteredProjectsSelector } from 'ng-project/project-list/selectors';

import { DashboardRecentProjectsItem } from '../types/recent-projects.types';

const app = 'prospect';

const dashboardRecentProjectsSelector = createSelector(
  filteredProjectsSelector,
  projects => {
    const tagFilter = new SetFilter(getRecentFilter());
    return projects
      .filter(project => tagFilter.payload.recent <= (project?.updated?.ts || project?.created?.ts))
      .map(project => ({
        project,
        energySystem: getProjectDefaultSystem(project, app),
      } as DashboardRecentProjectsItem));
  }
);

export const selectAllRecentProjectsDashboardItem = pipe(
  select(dashboardRecentProjectsSelector),
  distinctUntilChanged((p1, p2) => isEqual(p1, p2))
);
