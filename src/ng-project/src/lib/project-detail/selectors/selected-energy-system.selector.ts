import { createSelector, MemoizedSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnergySystemRef, getEnergySystemId, getProjectAppId } from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';

import { EnergySystemsState } from 'ng-project/project/reducers/energy-systems.reducer';
import { ProjectDataState } from 'ng-project/project/reducers/project-data.reducer';

import { getProjectMetadataStatus, MetadataStatus, ProjectsState } from '../../project/reducers/projects.reducer';
import { State } from '../reducers';

const getEnergySystems = (state: State): EnergySystemsState => state.project.energySystems;
const getSelectedSystem = (state: State): EnergySystemRef => state.projectDetail?.selectedEnergySystem;
const getProjects = (state: State): ProjectsState => state.project.projects;
const getProjectData = (state: State): ProjectDataState => state.project.projectData;

const selectedEnergySystemSelector = createSelector(
  getSelectedSystem,
  getEnergySystems,
  (systemRef, energySystems) => systemRef && energySystems.get(getEnergySystemId(systemRef))
);

const selectedEnergySystemRefSelector = createSelector(getSelectedSystem, system => system);

const selectedEnergySystemIdSelector = createSelector(
  getSelectedSystem,
  systemRef => getEnergySystemId(systemRef)
);

const selectedEnergySystemProjectSelector = createSelector(
  getSelectedSystem,
  getProjects,
  (systemRef, projects) => systemRef && projects.get(systemRef.projectId)
);

const selectedEnergySystemDataSelector = createSelector(
  getSelectedSystem,
  getProjectData,
  (systemRef, projectData) => systemRef && projectData[getEnergySystemId(systemRef)]
);

const selectedProjectAppDataSelector = createSelector(
  getSelectedSystem,
  getProjectData,
  (systemRef, projectData) => systemRef && projectData[getProjectAppId(systemRef)]
);

export const selectSelectedEnergySystem = pipe(select(selectedEnergySystemSelector));

export const selectSelectedEnergySystemRef = pipe(select(selectedEnergySystemRefSelector));

export const selectSelectedEnergySystemId = pipe(select(selectedEnergySystemIdSelector));

export const selectSelectedEnergySystemProject = pipe(select(selectedEnergySystemProjectSelector));

export const selectSelectedEnergySystemData = pipe(
  select(selectedEnergySystemDataSelector),
  map(data => data && data.dataset)
);

export const selectSelectedProjectAppData = pipe(
  select(selectedProjectAppDataSelector),
  map(data => data && data.dataset)
);

export const selectSelectedEnergySystemMetadataStatus =
  (app: SolargisApp): MemoizedSelector<State, MetadataStatus> =>
    createSelector(selectedEnergySystemProjectSelector, project => getProjectMetadataStatus(project, app));

export const selectSelectedEnergySystemMetadataLatest =
  (app: SolargisApp): MemoizedSelector<State, boolean> =>
    createSelector(selectSelectedEnergySystemMetadataStatus(app), metadataStatus => metadataStatus.latest);
