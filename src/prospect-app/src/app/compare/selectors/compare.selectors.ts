import { createSelector, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { pipe } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount } from 'rxjs/operators';

import { combineDataArray } from '@solargis/types/dataset';
import { getEnergySystemId, getProjectAppId } from '@solargis/types/project';

import { State } from 'ng-project/project-detail/reducers';
import { CompareState } from 'ng-project/project/reducers/compare.reducer';
import { EnergySystemsState } from 'ng-project/project/reducers/energy-systems.reducer';
import { ProjectDataState } from 'ng-project/project/reducers/project-data.reducer';
import { getCompareState } from 'ng-project/project/selectors/compare.selectors';

import { CompareEnergySystems } from '../compare.types';

const getProjectData = (state: State): ProjectDataState => state.project.projectData;
const getEnergySystems = (state: State): EnergySystemsState => state.project.energySystems;

const compareSelector = createSelector(
  getCompareState,
  getProjectData,
  (compare, data) => [compare, data]
);

const selectedCompareEnergySystemsSelector = createSelector(
  getCompareState,
  getEnergySystems,
  (compare, energySystems) => [compare, energySystems]
);

/**
 * Retrieve lta data for compare
 *
 * @param store
 */
export const selectCompareAppData = pipe(
  select(compareSelector),
  map(([compare, data]: [CompareState, ProjectDataState]) =>
    compare.reduce((acc, ref) => {
      const itemData = data[getProjectAppId(ref)];
      const dataset = itemData && itemData.dataset;
      if (dataset) {
        acc[getEnergySystemId(ref)] = combineDataArray(dataset.lta, dataset.pvcalcDetails);
      } else {
        acc[getEnergySystemId(ref)] = {};
      }
      return acc;
    }, {})
  ),
  distinctUntilChanged(isEqual),
  publishReplay(),
  refCount()
);

/**
 * Retrieve energy system data for compare
 *
 * @param store
 */
export const selectCompareEnergySystemData = pipe(
  select(compareSelector),
  map(([compare, data]: [CompareState, ProjectDataState]) =>
    compare.reduce((acc, ref) => {
      const itemData = data[getEnergySystemId(ref)];
      acc[getEnergySystemId(ref)] = itemData && itemData.dataset && itemData.dataset.pvcalc;
      return acc;
    }, {})
  ),
  distinctUntilChanged(isEqual),
  publishReplay(),
  refCount()
);

/**
 * Retrieve energy system for compare
 *
 * @param store
 */

export const selectCompareEnergySystems = pipe(
  select(selectedCompareEnergySystemsSelector),
  map(([compare, energySystems]: [CompareState, any]) =>
    compare.reduce((acc, ref) => {
      acc[getEnergySystemId(ref)] = energySystems.get(getEnergySystemId(ref));
      return acc;
    }, {} as CompareEnergySystems)
  )
);
