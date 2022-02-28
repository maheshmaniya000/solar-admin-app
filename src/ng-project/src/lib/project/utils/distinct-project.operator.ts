import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { getProjectAppSubscriptionType, Project } from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';

import { getProjectApps, getProjectMetadataStatus } from '../reducers/projects.reducer';

const projectIdEquals = <P extends Project = Project>(p1: P, p2: P): boolean => p1 === p2 || (p1 && p2 && p1._id === p2._id);

export function distinctProjectById<P extends Project = Project>(): (source: Observable<P>) => Observable<P> {
  return (source: Observable<P>): Observable<P> => source.pipe(distinctUntilChanged(projectIdEquals));
}

export function distinctProjectByProjectAppSubscriptionType(app: SolargisApp): (source: Observable<Project>) => Observable<Project> {
  return (source: Observable<Project>): Observable<Project> => source.pipe(
      distinctUntilChanged((p1, p2) =>
        projectIdEquals(p1, p2) && getProjectAppSubscriptionType(p1, app) === getProjectAppSubscriptionType(p2, app))
    );
}

export function distinctProjectByIdAndLatestDataStatus<P extends Project = Project>(): MonoTypeOperatorFunction<P> {
  return distinctUntilChanged<P>((p1, p2) => projectIdEquals(p1, p2) &&
    getProjectApps(p1).reduce(
      (acc, app) => getProjectMetadataStatus(p1, app).latest === getProjectMetadataStatus(p2, app).latest,
      true
    ));
}
