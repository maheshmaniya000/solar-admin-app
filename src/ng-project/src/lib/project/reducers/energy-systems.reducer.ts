import { Project, ProjectId, EnergySystem, getEnergySystemId, UpdateEnergySystemOpts, EnergySystemRef } from '@solargis/types/project';
import { OrderedMap, isEmpty, removeEmpty } from '@solargis/types/utils';

import {
  ENERGY_SYSTEM_DELETE, ENERGY_SYSTEM_DELETED, ENERGY_SYSTEM_ERROR, ENERGY_SYSTEM_LOAD, ENERGY_SYSTEM_LOADED,
  ENERGY_SYSTEM_SAVE_PV_CONFIG, ENERGY_SYSTEM_SAVED, ENERGY_SYSTEM_UPDATE, ENERGY_SYSTEM_UPDATED, Actions
} from '../actions/energy-systems.actions';
import {
  PROJECT_LOADED, PROJECT_SAVED, PROJECT_SET_PROJECTS, PROJECT_REMOVE_PROJECTS, PROJECT_UPDATED, Actions as ProjectActions,
} from '../actions/project.actions';

export type EnergySystemProgress = {
  load?: boolean;
  save?: boolean;
  update?: UpdateEnergySystemOpts;
  delete?: boolean;
};

export type EnergySystemWithProgress = Partial<EnergySystem> & EnergySystemRef & { progress?: EnergySystemProgress };
export type EnergySystemsState = OrderedMap<EnergySystemWithProgress>;

const keyFn = getEnergySystemId;

function getProjectDefaultSystems(project: Project): EnergySystem[] {
  return Object.keys(project.app || {})
    .map(app => project.app[app].defaultSystem)
    .filter(system => !isEmpty(system))
    .map(system => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dataset, ...energySystem } = system; // omit dataset
      return energySystem;
    });
}

function isEmptyEnergySystem(system: EnergySystemWithProgress): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { projectId, app, systemId, ...noRefSystem } = system;
  return isEmpty(noRefSystem);
}

export function energySystemsReducer(
  state: EnergySystemsState = OrderedMap.empty(keyFn),
  action: ProjectActions | Actions
): EnergySystemsState {

  function setProgress(ref: EnergySystemRef, progress: EnergySystemProgress): EnergySystemsState {
    const system = state.get(keyFn(ref)) || { ...ref };
    const systemProgress = system.progress || {};
    return state.set({ ...system, progress: { ...systemProgress, ...progress } });
  }

  function clearProgress(ref: EnergySystemRef, progressKey: string): EnergySystemsState {
    const systemKey = keyFn(ref);
    const system = state.get(systemKey);
    if (system) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [progressKey]: omit, ...otherProgress } = system.progress || { [progressKey]: undefined };
      const newSystem = removeEmpty({ ...system, progress: otherProgress });
      return isEmptyEnergySystem(newSystem) ? state.remove(newSystem) : state.set(newSystem);
    }
    return state;
  }

  switch (action.type) {

    // project actions

    case PROJECT_SET_PROJECTS: {
      const projects: Project[] = action.payload || [];
      const defaultSystems = projects.flatMap(getProjectDefaultSystems);
      return new OrderedMap(defaultSystems, keyFn);
    }
    case PROJECT_LOADED: {
      const project = action.payload;
      const defaultSystems = getProjectDefaultSystems(project);
      return defaultSystems.length ? state.addAll(defaultSystems) : state;
    }
    case PROJECT_SAVED: {
      const { newProject } = action.payload;
      const defaultSystems = getProjectDefaultSystems(newProject);
      return defaultSystems.length ? state.addAll(defaultSystems) : state;
    }
    case PROJECT_UPDATED: {
      const { updatedProject } = action.payload;
      const defaultSystems = getProjectDefaultSystems(updatedProject);
      return defaultSystems.length ? state.addAll(defaultSystems) : state;
    }
    case PROJECT_REMOVE_PROJECTS: {
      const _id: ProjectId[] = action.payload;
      return state.filter(system => !_id.includes(system.projectId));
    }

    // energy system actions

    case ENERGY_SYSTEM_ERROR: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { error, progressKey, ...systemRef } = action.payload;
      return clearProgress(systemRef, progressKey);
    }
    case ENERGY_SYSTEM_LOAD: {
      const loadSystemRef = action.payload;
      return setProgress(loadSystemRef, { load: true });
    }
    case ENERGY_SYSTEM_LOADED: {
      const { energySystems, ...loadSystemRef } = action.payload;
      return clearProgress(loadSystemRef, 'load').addAll(energySystems);
    }
    case ENERGY_SYSTEM_SAVE_PV_CONFIG: {
      const { systemRef } = action.payload;
      return setProgress(systemRef, { save: true });
    }
    case ENERGY_SYSTEM_SAVED: {
      const newSystem = action.payload;
      const { projectId, app } = newSystem;
      return clearProgress({ projectId, app }, 'save').add(newSystem);
    }
    case ENERGY_SYSTEM_UPDATE: {
      const { systemRef, update } = action.payload;
      return setProgress(systemRef, { update });
    }
    case ENERGY_SYSTEM_UPDATED: {
      const { updatedSystem } = action.payload;
      return state.set(updatedSystem);
    }
    case ENERGY_SYSTEM_DELETE: {
      const systemRef = action.payload;
      return setProgress(systemRef, { delete: true });
    }
    case ENERGY_SYSTEM_DELETED: {
      const systemRef = action.payload;
      return state.remove(systemRef);
    }
    default:
      return state;
  }
}

