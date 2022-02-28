import { mergeData, VersionedDatasetDataMap } from '@solargis/types/dataset';
import {
  getEnergySystemId,
  getProjectDatasetDataMap,
  getProjectDefaultSystemId,
  Project,
  ProjectId
} from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';
import { filterKeys, isEmpty, removeEmpty } from '@solargis/types/utils';

import {
  ENERGY_SYSTEM_DELETED,
  EnergySystemDeleted
} from '../actions/energy-systems.actions';
import {
  Actions,
  PROJECT_DATA_CLEAR,
  PROJECT_DATA_ERROR,
  PROJECT_DATA_LOAD,
  PROJECT_DATA_LOADED,
  PROJECT_DATA_NOT_FOUND
} from '../actions/project-data.actions';
import {
  Actions as ProjectActions,
  PROJECT_LOADED,
  PROJECT_REMOVE_PROJECTS,
  PROJECT_SAVED,
  PROJECT_SET_PROJECTS,
  PROJECT_UPDATED
} from '../actions/project.actions';

export type ProjectDataProgress = {
  load?: boolean;
};

export type ProjectDataWithProgress = {
  dataset: VersionedDatasetDataMap;
  progress?: ProjectDataProgress;
};

export type ProjectDataState = {
  [systemRef: string]: ProjectDataWithProgress;
};

function mergeProjectData(
  systemRef: string,
  mergeDataset: VersionedDatasetDataMap,
  state: ProjectDataState
): ProjectDataWithProgress {
  const { progress, dataset } = state[systemRef] || {
    progress: {},
    dataset: {}
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { load, ...otherProgress } = progress || { load: false }; // omit load progress
  return removeEmpty({
    progress: otherProgress,
    dataset: mergeData(dataset, mergeDataset)
  });
}

/**
 * Get ProjectDataState converted from datasets inside of Project, if state provided, datasets will be merged with current datasets
 *
 * @param project
 * @param state
 * @returns
 */
 function projectToProjectDataState(
  project: Project,
  state: ProjectDataState = {}
): ProjectDataState {
  if (!project || !project.app) {return state;}
  const projectId = project._id;
  return Object.keys(project.app).reduce((dataState, app: SolargisApp) => {
    const dataset = getProjectDatasetDataMap(project, app);
    if (!isEmpty(dataset)) {
      const systemRef = getEnergySystemId({ projectId, app });
      dataState[systemRef] = mergeProjectData(systemRef, dataset, state);
    }
    const defaultSystemDataset = getProjectDatasetDataMap(project, app, true);
    if (!isEmpty(defaultSystemDataset)) {
      const systemId = getProjectDefaultSystemId(project, app);
      const systemRef = getEnergySystemId({ projectId, app, systemId });
      dataState[systemRef] = mergeProjectData(
        systemRef,
        defaultSystemDataset,
        state
      );
    }
    return dataState;
  }, {});
}

export function projectDataReducer(
  state: ProjectDataState = {},
  action: Actions | ProjectActions | EnergySystemDeleted
): ProjectDataState {
  switch (action.type) {
    case PROJECT_DATA_LOAD: {
      const systemRef = getEnergySystemId(action.payload);
      const { progress, dataset } = state[systemRef] || {
        progress: {},
        dataset: undefined
      };
      return {
        ...state,
        [systemRef]: { progress: { ...progress, load: true }, dataset }
      };
    }
    case PROJECT_DATA_LOADED: {
      const systemRef = getEnergySystemId(action.payload);
      const systemRefData = mergeProjectData(
        systemRef,
        action.payload.dataset,
        state
      );
      return { ...state, [systemRef]: systemRefData };
    }
    case PROJECT_DATA_CLEAR: {
      const systemRef = getEnergySystemId(action.payload);
      if (state[systemRef]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [systemRef]: dataToClear, ...otherData } = state;
        return otherData;
      } else {return state;}
    }
    case PROJECT_DATA_ERROR: {
      // remove progress load only
      const systemRef = getEnergySystemId(action.payload);
      const { progress, dataset } = state[systemRef] || {
        progress: { load: true },
        dataset: {}
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { load, ...otherProgress } = progress;
      return {
        ...state,
        [systemRef]: removeEmpty({ progress: otherProgress, dataset })
      };
    }

    // Project actions

    case PROJECT_SET_PROJECTS: {
      const projects: Project[] = action.payload || [];
      const temporal: Project = action.temporal;

      // copy temporal project data
      const temporalState = temporal
        ? filterKeys(state, key => key.startsWith(temporal._id))
        : {};

      return projects.reduce((newState, project) => {
        Object.assign(newState, projectToProjectDataState(project, newState));
        return newState;
      }, temporalState);
    }
    case PROJECT_LOADED: {
      const project = action.payload;
      const projectDataState = projectToProjectDataState(project, state);
      return { ...state, ...projectDataState };
    }
    case PROJECT_SAVED: {
      const { newProject } = action.payload;
      const projectDataState = projectToProjectDataState(newProject, state);
      return { ...state, ...projectDataState };
    }
    case PROJECT_UPDATED: {
      const { updatedProject } = action.payload;
      const projectDataState = projectToProjectDataState(updatedProject, state);
      return { ...state, ...projectDataState };
    }
    case PROJECT_REMOVE_PROJECTS: {
      const _id: ProjectId[] = action.payload;
      return filterKeys(
        state,
        systemRef => !_id.find(id => systemRef.startsWith(id))
      );
    }

    // EnergySystem actions

    case PROJECT_DATA_NOT_FOUND: // ignoring resolution for now
    case ENERGY_SYSTEM_DELETED: {
      const systemRef = getEnergySystemId(action.payload);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [systemRef]: omit, ...otherData } = state;
      return otherData;
    }
    default:
      return state;
  }
}
