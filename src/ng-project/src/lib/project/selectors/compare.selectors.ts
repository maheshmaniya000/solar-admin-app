import { createSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { EnergySystemRef, getEnergySystemId, hasPvConfig } from '@solargis/types/project';

import { State } from '../reducers';
import { CompareState } from '../reducers/compare.reducer';
import { EnergySystemsState } from '../reducers/energy-systems.reducer';
import { ProjectsState } from '../reducers/projects.reducer';
import { CompareItem } from '../types/compare.types';

export const getCompareState = (state: State): CompareState => state.project.compare;
export const getProjects = (state: State): ProjectsState => state.project.projects;
export const getEnergySystem = (state: State): EnergySystemsState => state.project.energySystems;

export const selectCompareEnergySystemRefs = pipe(
  select(createSelector(getCompareState, compare => compare)),
  distinctUntilChanged()
);

export const selectCompareItemCount = pipe(
  selectCompareEnergySystemRefs,
  map((refs: EnergySystemRef[]) => refs.length)
);

const compareSelector = createSelector(
  getCompareState,
  getProjects,
  getEnergySystem,
  (compare, projects, energySystems) => compare.map((energySystemRef, i) => ({
    energySystemRef,
    highlighted: energySystemRef.highlighted,
    colorIndex: i,
    energySystemId: getEnergySystemId(energySystemRef),
    project: projects.get(energySystemRef.projectId),
    energySystem: energySystems.get(getEnergySystemId(energySystemRef))
  })) as CompareItem[]
);


export const selectCompareItems = pipe(
  select(compareSelector),
  distinctUntilChanged()
);

export const selectCompareItemsWithPvConfig = pipe(
  selectCompareItems,
  map(items => items.filter(item => hasPvConfig(item.energySystem))),
  distinctUntilChanged()
);

export const selectHasCompareItemsWithPvConfig = pipe(
  selectCompareItemsWithPvConfig,
  map(items => !!items && items.length > 0)
);
