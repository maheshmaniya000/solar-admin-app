import { createSelector, MemoizedSelector, select } from '@ngrx/store';
import { OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { VersionedDatasetDataMap } from '@solargis/types/dataset';
import { getEnergySystemId, getProjectDefaultSystemId } from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';

import { ProjectDataState } from 'ng-project/project/reducers/project-data.reducer';

import { ExtendedProject, ProjectsState } from '../../project/reducers/projects.reducer';
import { State } from '../reducers';
import { ProjectSelected } from '../reducers/selected.reducer';
import { filteredProjectsSelector } from './filter.selector';

// selectors as pipes:
// https://github.com/ngrx/platform/blob/master/docs/store/selectors.md

const getProjects = (state: State): ProjectsState => state.project.projects;
const getProjectData = (state: State): ProjectDataState => state.project.projectData;
const getSelected = (state: State): ProjectSelected => state.projectList?.selected ?? { multi: [] };

const selectedProjectSelector = createSelector(
  getSelected,
  getProjects,
  (selected, projects): ExtendedProject => selected.single ? projects.get(selected.single) : null
);

const selectedProjectSystemRef = (app: SolargisApp, defaultSystem = false): MemoizedSelector<State, string> =>
  createSelector(selectedProjectSelector, project => {
    if (!project) { return undefined; }
    const projectId = project._id;
    const systemId = defaultSystem ? getProjectDefaultSystemId(project, app) : undefined;
    return !defaultSystem || systemId
      ? getEnergySystemId({ projectId, app, systemId })
      : undefined;
  });

export const selectSelectedProjectData = (app: SolargisApp, defaultSystem = false): OperatorFunction<State, VersionedDatasetDataMap> =>
  pipe(
    select(
      createSelector(
        selectedProjectSystemRef(app, defaultSystem),
        getProjectData,
        (systemRef, projectData) => systemRef && projectData[systemRef]
      )
    ),
    map(data => data && data.dataset)
  );

export const selectSelectedProject = pipe(select(selectedProjectSelector));

const isAllProjectsSelected = createSelector(
  filteredProjectsSelector,
  getSelected,
  (projects, selected) => {
    const multi = new Set(selected.multi);
    return selected.multi.length && projects.every(project => multi.has(project._id));
  }
);

/**
 * Select flag if all projects are multi selected
 */
export const selectIsAllProjectsSelected = pipe(
  select(isAllProjectsSelected),
  distinctUntilChanged()
);

const filteredSelectedProjectsSelector = createSelector(
  filteredProjectsSelector,
  getSelected,
  (projects, selected) => projects.filter(project => selected.multi.includes(project._id))
);

export const selectFilteredSelectedProjects = pipe(
  select(filteredSelectedProjectsSelector),
  map(projects => projects.toArray())
);

const isSelectedMulti = createSelector(
  filteredSelectedProjectsSelector,
  projects => !!projects && projects.length > 0
);

export const selectIsSelectedMulti = pipe(
  select(isSelectedMulti),
  distinctUntilChanged()
);

export const selectIsSelectedProjectTemporal = pipe(
  select(selectedProjectSelector),
  map(project => project && (!project.created || project.status === 'temporal')),
  distinctUntilChanged()
);
