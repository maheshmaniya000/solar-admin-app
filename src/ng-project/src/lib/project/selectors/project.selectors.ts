import { createSelector, select } from '@ngrx/store';
import { OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { EnergySystemRef, getEnergySystemId, ProjectId } from '@solargis/types/project';

import { State } from '../reducers';
import { EnergySystemsState, EnergySystemWithProgress } from '../reducers/energy-systems.reducer';
import { ExtendedProject, ProjectsState } from '../reducers/projects.reducer';

const getEnergySystems = (state: State): EnergySystemsState => state.project.energySystems;
const getProjects = (state: State): ProjectsState => state.project.projects;

export function selectEnergySystem(systemRef: EnergySystemRef): OperatorFunction<State, EnergySystemWithProgress> {
  return pipe(
    select(createSelector(getEnergySystems, energySystems => energySystems)),
    map(energySystems => energySystems.get(getEnergySystemId(systemRef))),
    distinctUntilChanged()
  );
}

export function selectProject(projectId: ProjectId): OperatorFunction<State, ExtendedProject> {
  return pipe(
    select(createSelector(getProjects, energySystems => energySystems)),
    map(projects => projects.get(projectId)),
    distinctUntilChanged()
  );
}

export function selectProjects(projectIds: ProjectId[]): OperatorFunction<State, ExtendedProject[]> {
  return pipe(
    select(createSelector(getProjects, projects => projects)),
    map(projects => projects.filter(project => projectIds.includes(project._id)).toArray()),
    distinctUntilChanged()
  );
}
