import { createSelector, MemoizedSelector } from '@ngrx/store';

import { mergeData, VersionedDatasetDataMap } from '@solargis/types/dataset';
import { EnergySystemRef, getProjectAppId } from '@solargis/types/project';

import { State } from '../reducers';
import { ProjectDataState, ProjectDataWithProgress } from '../reducers/project-data.reducer';

const getProjectData = (state: State): ProjectDataState => state.project.projectData;

export function getProjectAppDataSelector(ref: EnergySystemRef): MemoizedSelector<State, ProjectDataWithProgress> {
  return createSelector(
    getProjectData,
    projectData => ref && projectData[getProjectAppId(ref)]
  );
}

export function getAllProjectDataSelector(systemRef: EnergySystemRef): MemoizedSelector<State, VersionedDatasetDataMap> {
  const { projectId, app, systemId } = systemRef;
  const projectAppDataSelector = getProjectAppDataSelector({ projectId, app });
  if (!systemId) {
    return createSelector(projectAppDataSelector, projectData => projectData.dataset);
  }
  return createSelector(projectAppDataSelector,
    getProjectAppDataSelector({ projectId, app, systemId }),
    (projectData, systemData) => mergeData(projectData.dataset, systemData.dataset));
}
