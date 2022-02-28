import { filterDataByResolution, mergeData, VersionedDatasetDataMap } from '@solargis/types/dataset';
import {
  getProjectDefaultSystem,
  isProjectDefaultSystem,
  Project,
  ProjectApp,
  ProjectId,
  UpdateProjectOpts
} from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';
import { isEmpty, OrderedMap, removeEmpty } from '@solargis/types/utils';

import {
  Actions as ProjectDataActions,
  PROJECT_DATA_ERROR,
  PROJECT_DATA_LOAD,
  PROJECT_DATA_LOADED,
  PROJECT_DATA_UPDATE,
  PROJECT_DATA_UPDATED
} from '../actions/project-data.actions';
import {
  Actions,
  PROJECT_ADD,
  PROJECT_BULK_DELETE,
  PROJECT_BULK_ERROR,
  PROJECT_BULK_UPDATE,
  PROJECT_BULK_UPDATED,
  PROJECT_DELETE,
  PROJECT_ERROR,
  PROJECT_LOAD,
  PROJECT_LOADED,
  PROJECT_REMOVE_PROJECTS,
  PROJECT_SAVED,
  PROJECT_SAVE_SITE,
  PROJECT_SET_PROJECTS,
  PROJECT_UPDATE,
  PROJECT_UPDATED,
  PROJECT_UPDATE_METADATA_STATUS
} from '../actions/project.actions';

export type MetadataStatus = {
  latest?: boolean;
  dismissed?: boolean;
};

export type ProjectProgress = {
  load?: boolean;
  save?: boolean;
  update?: UpdateProjectOpts;
  delete?: boolean;
  siteData?: boolean;
  updateData?: boolean;
};

export type ExtendedProject = Omit<Project, 'app'> & {
  progress?: ProjectProgress;
  app?: {
    [key: string]: ProjectApp & {
      metadataStatus?: MetadataStatus;
    };
  };
};

export type ProjectsState = OrderedMap<ExtendedProject>;

function getSafeProjectApp(project: Project, app: SolargisApp): ProjectApp {
  return (project.app && project.app[app]) || { app };
}

function mergeProjectAppDataset(projectApp: ProjectApp, defaultSystem: boolean, nextDataset: VersionedDatasetDataMap): ProjectApp {
  return removeEmpty({
    ...projectApp,
    dataset: defaultSystem ? projectApp.dataset : nextDataset,
    defaultSystem: defaultSystem
      ? { ...projectApp.defaultSystem, dataset: nextDataset }
      : projectApp.defaultSystem
  });
}

function setUpdateDataProgress(projectId: ProjectId, state: ProjectsState, updateData: boolean): ProjectsState {
  const project: ExtendedProject = state.get(projectId);
  if (!project) {return state;}
  const progress = project.progress ?? {};
  return state.set({
    ...project,
    progress: { ...progress, updateData }
  });
}

export function getProjectMetadataStatus(project: ExtendedProject, app: SolargisApp): MetadataStatus {
  return project?.app?.[app]?.metadataStatus ?? { dismissed: false };
}

const emptyProgress = {
  load: undefined,
  save: undefined,
  update: {},
  delete: undefined,
  updateData: undefined
}; // no siteData intentionally

// eslint-disable-next-line complexity
export function projectsReducer(
  state: ProjectsState = OrderedMap.empty<ExtendedProject>(),
  action: Actions | ProjectDataActions
): OrderedMap<Project> {
  switch (action.type) {
    case PROJECT_LOAD: {
      const project = state.get(action.payload);

      if (!project) {return state;}

      const progress = project.progress || {};
      return state.set({ ...project, progress: { ...progress, load: true } });
    }
    case PROJECT_LOADED: {
      const project = action.payload;
      return state.set(project);
    }
    case PROJECT_SAVE_SITE: {
      const project = state.get(action.payload);
      if (!project?.created) {
        const progress = project.progress || {};
        return state.set({ ...project, progress: { ...progress, save: true } });
      }
      return state;
    }
    case PROJECT_SAVED: {
      const { temporalId, newProject } = action.payload;
      return state.replace(temporalId, newProject);
    }
    case PROJECT_ERROR: {
      const { _id: projectId } = action.payload;
      const project: ExtendedProject = state.get(projectId);

      if (!project) {return state;}

      // reset load, save, update and delete progress
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { load, save, update, delete: del, ...progress } = project.progress || emptyProgress;
      return state.set({ ...project, progress });
    }
    case PROJECT_UPDATE: {
      const { _id, ...update } = action.payload;
      const project: ExtendedProject = state.get(_id);

      if (!project) {return state;}

      // update temporal project directly
      if (!project.created) {
        return state.set({
          ...project,
          site: update.site ? { ...project.site, ...update.site } : project.site
        });
      } else {
        // update progress only, will be updated via API
        const progress = project.progress || {};
        return state.set({ ...project, progress: { ...progress, update } });
      }
    }
    case PROJECT_UPDATED: {
      const { updatedProject } = action.payload;
      return state.set(updatedProject);
    }
    case PROJECT_DELETE: {
      const _id = action.payload;
      const project: ExtendedProject = state.get(_id);

      if (!project) {return state;}

      const progress = project.progress || {};
      return state.set({ ...project, progress: { ...progress, delete: true } });
    }
    case PROJECT_BULK_UPDATE: {
      const { _id, update } = action.payload;
      const projectsUpdating = _id
        .map(id => state.get(id))
        .filter(project => !!project)
        .map(project => {
          const progress = project.progress || {};
          return { ...project, progress: { ...progress, update } };
        });
      return isEmpty(projectsUpdating) ? state : state.setAll(projectsUpdating);
    }
    case PROJECT_BULK_ERROR: {
      return state;
    }
    case PROJECT_BULK_UPDATED: {
      const { _id, update: bulkUpdate } = action.payload;
      // apply update in place, only simple updates in bulk update
      const updatedProjects = _id
        .map(id => state.get(id))
        .filter(project => !!project)
        .map(project => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { save, update, delete: del, ...progress } = project.progress || emptyProgress;
          return { ...project, ...bulkUpdate, progress };
        });
      return state.setAll(updatedProjects);
    }
    case PROJECT_BULK_DELETE: {
      const projectsDeleting = action.payload
        .map(id => state.get(id))
        .filter(project => !!project)
        .map(project => {
          const progress = project.progress || {};
          return { ...project, progress: { ...progress, delete: true } };
        });
      return isEmpty(projectsDeleting) ? state : state.setAll(projectsDeleting);
    }
    case PROJECT_DATA_LOAD: {
      const { projectId } = action.payload;
      const project: ExtendedProject = state.get(projectId);

      if (!project || project.created) {return state;}

      const progress = project.progress || {};
      return state.set({ ...project, progress: { ...progress, siteData: true }});
    }
    case PROJECT_DATA_LOADED: {
      const { projectId, app, systemId, dataset } = action.payload;
      const project: ExtendedProject = state.get(projectId);

      if (!project) {return state;}

      // omit siteData from progress
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { siteData, ...progress } = project.progress || { siteData: false };

      // merge dataset into project.app[app] - annual data only
      const projectApp = getSafeProjectApp(project, app);
      const defaultSystem = getProjectDefaultSystem(project, app);

      if (systemId && !isProjectDefaultSystem(project, app, systemId)) {
        return state;
      }
      const annualDataset = filterDataByResolution(dataset, 'annual');
      const prevDataset = (systemId ? defaultSystem.dataset : projectApp.dataset) || {};
      const nextDataset = !isEmpty(annualDataset)
        ? mergeData(prevDataset, annualDataset)
        : prevDataset;

      return state.set({
        ...project,
        progress,
        app: {
          ...project.app, // copy other apps
          [app]: mergeProjectAppDataset(projectApp, !!systemId, nextDataset)
        }
      });
    }
    case PROJECT_DATA_UPDATE: {
      return setUpdateDataProgress(action.payload.projectId, state, true);
    }
    case PROJECT_DATA_UPDATED: {
      return setUpdateDataProgress(action.payload._id, state, false);
    }
    case PROJECT_DATA_ERROR: {
      const { projectId } = action.payload;
      const project: ExtendedProject = state.get(projectId);

      if (!project || project.created) {return state;}

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { siteData, ...progress } = project.progress || { siteData: false };
      return state.set({ ...project, progress });
    }
    case PROJECT_SET_PROJECTS: {
      const list: Project[] = action.payload;
      const unsavedProjects = state.keys
        .filter(id => {
          const checkProject: ExtendedProject = state.get(id);
          const checkProgress = checkProject.progress || {};
          return !checkProject.created && !checkProgress.save;
        })
        .map(id => state.get(id));
      return new OrderedMap<Project>([...list, ...unsavedProjects]);
    }
    case PROJECT_ADD: {
      return state.add(action.payload);
    }
    case PROJECT_REMOVE_PROJECTS: {
      const _id: ProjectId[] = action.payload;
      return state.removeAll(_id);
    }
    case PROJECT_UPDATE_METADATA_STATUS: {
      return state.setAll(action.payload
        .filter(({ projectId }) => state.get(projectId)?.created)
        .map(({ projectId, app, ...metadataStatus }) => {
          const project = state.get(projectId);
          return {
            ...project,
            app: {
              ...project.app,
              [app]: {
                ...project.app[app],
                metadataStatus: { ...getProjectMetadataStatus(project, app), ...metadataStatus }
              }
            }
          };
        }));
    }
    default:
      return state;
  }
}

export function getProjectProgress(project: ExtendedProject): ProjectProgress {
  return (project && project.progress) || {};
}

export function getProjectApps(project: Project): SolargisApp[] {
  return Object.keys(project?.app ?? []) as SolargisApp[];
}
