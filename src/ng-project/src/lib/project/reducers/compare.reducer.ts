import { EnergySystemRef } from '@solargis/types/project';

import {
  Actions,
  COMPARE_CLEAR,
  COMPARE_REMOVE_PROJECT,
  COMPARE_ADD_PROJECT_AFTER_CHECKED,
  COMPARE_BULK_EDIT,
  COMPARE_HIGHLIGHT
} from '../actions/compare.actions';
import { ENERGY_SYSTEM_SAVED, PvConfigSaved } from '../actions/energy-systems.actions';
import { PROJECT_REMOVE_PROJECTS, RemoveProjects } from '../actions/project.actions';

export type CompareState = (EnergySystemRef & { highlighted: boolean })[];


function energyRefEquals(ref1: EnergySystemRef, ref2: EnergySystemRef): boolean {
  return (ref1.app === ref2.app && ref1.projectId === ref2.projectId && ref1.systemId === ref2.systemId);
}

function removeFromCompare(state: CompareState, toRemove: EnergySystemRef): CompareState {
  const index = state.findIndex(ref => energyRefEquals(ref, toRemove));
  if (index !== -1) {state.splice(index, 1);}
  return state;
}

export const COMPARE_MAX_PROJECTS = 4;

export function compareReducer(state: CompareState = [], action: Actions | PvConfigSaved | RemoveProjects): EnergySystemRef[] {
  switch (action.type) {
    case COMPARE_ADD_PROJECT_AFTER_CHECKED: {
      if (!state.find(ref => energyRefEquals(ref, action.payload)) && state.length < COMPARE_MAX_PROJECTS)
        {return [...state, action.payload];}
      else {return state;}
    }
    case COMPARE_REMOVE_PROJECT: {
      return removeFromCompare([...state], action.payload);
    }
    case COMPARE_BULK_EDIT: {
      const { toAdd, toRemove, clearAll } = action.payload;

      if (state.length + (toAdd && toAdd.length) - (toRemove && toRemove.length) > COMPARE_MAX_PROJECTS) {
        return state;
      } else {
        let compare = [...state];
        if (clearAll) {
          compare = [];
        } else if (toRemove) {
          toRemove.forEach(item => {
            compare = removeFromCompare(compare, item);
          });
        }
        return [...compare, ...toAdd];
      }
    }
    case COMPARE_HIGHLIGHT: {
      const newState = state.map(item => ({ ...item, highlighted: false }));
      const isItemHighlighted = state.some(item =>
        !!item.highlighted &&
        item.projectId === action.payload.projectId &&
        item.systemId === action.payload.systemId);

      if (!!action.payload.highlighted && isItemHighlighted) {return newState;}

      newState.forEach(item => {
        if (energyRefEquals(item, action.payload)) {
          item.highlighted = true;
        }
      });
      return newState;
    }
    case COMPARE_CLEAR: {
      return [];
    }
    // listen on energy system change
    case ENERGY_SYSTEM_SAVED: {
      const { systemId, projectId, app } = action.payload;

      if (state.find(i => i.projectId === projectId && i.app === app)) {
        return state.map(item => {
          if (item.projectId === projectId && item.app === app) {
            return { ...item, systemId };
          }
          return item;
        });
      } else {return state;}
    }
    case PROJECT_REMOVE_PROJECTS: {
      const removedProjectIds = action.payload;
      return state.filter(item => !removedProjectIds.includes(item.projectId));
    }
    default: {
      return state;
    }
  }
}

