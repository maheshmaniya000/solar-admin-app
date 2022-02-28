import { createSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { getProjectDefaultSystem, getEnergySystemId, EnergySystemRef } from '@solargis/types/project';

import { CompareItem } from '../types/compare.types';
import { getProjects } from './compare.selectors';

const app = 'prospect';

const savedProjectsAsCompareItemSelector = createSelector(
  getProjects,
  projects =>
    projects
      .filter(project => project.status === 'active' || project.status === 'initial')
      .map(project => {
        const energySystem = getProjectDefaultSystem(project, app);
        const energySystemRef = {
          projectId: project._id,
          app,
          // in case energySystem is null
          systemId: energySystem && energySystem.systemId
        } as EnergySystemRef;

        return {
          energySystemRef,
          project,
          energySystem: getProjectDefaultSystem(project, app),
          energySystemId: getEnergySystemId(energySystemRef)
        } as CompareItem;
      })
);

export const selectAllProjectsAsCompareItem = pipe(
  select(savedProjectsAsCompareItemSelector),
  distinctUntilChanged()
);
