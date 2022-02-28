import { createSelector, MemoizedSelector, select } from '@ngrx/store';
import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProjectId } from '@solargis/types/project';

import { State as UserState } from 'ng-shared/user/reducers';

import { compareReducer, CompareState } from './compare.reducer';
import { energySystemsReducer, EnergySystemsState } from './energy-systems.reducer';
import { metadataReducer, MetadataState } from './metadata.reducer';
import { projectDataReducer, ProjectDataState } from './project-data.reducer';
import { ExtendedProject, projectsReducer, ProjectsState } from './projects.reducer';
import { userTagsReducer, UserTagsState } from './user-tags.reducer';

export interface ProjectState {
  compare: CompareState;
  energySystems: EnergySystemsState;
  metadata: MetadataState;
  projectData: ProjectDataState;
  projects: ProjectsState;
  userTags: UserTagsState;
}

export interface State extends UserState {
  project: ProjectState;
}

export const reducers = {
  compare: compareReducer,
  energySystems: energySystemsReducer,
  metadata: metadataReducer,
  projectData: projectDataReducer,
  projects: projectsReducer,
  userTags: userTagsReducer
};

// selectors

const getProjects = (state: State): ProjectsState => state.project.projects;

const projectsByIdSelector = (...projectId: ProjectId[]): MemoizedSelector<State, ExtendedProject[]> => createSelector(
  getProjects,
  projects => projects.getAll(projectId)
);

export const selectProjectById = (projectId: ProjectId): OperatorFunction<State, ExtendedProject> => pipe(
  select(projectsByIdSelector(projectId)),
  map(projects => projects[0])
);

export const selectProjectsByIds = (projectIds: ProjectId[]): OperatorFunction<State, ExtendedProject[]> => pipe(
  select(projectsByIdSelector(...projectIds))
);
