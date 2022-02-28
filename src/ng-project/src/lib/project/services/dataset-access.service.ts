import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { isObservable, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DataLayer, DataLayerMap, Dataset, datasetWithAccess } from '@solargis/dataset-core';
import { Project } from '@solargis/types/project';

import { selectProjectPermissions, selectUserPermissions } from 'ng-shared/user/selectors/permissions.selectors';

import { State } from '../reducers';
import { distinctProjectByProjectAppSubscriptionType } from '../utils/distinct-project.operator';

@Injectable()
export class DatasetAccessService {

  constructor(private readonly store: Store<State>) {}

  dataLayersWithAccess$(dataLayers: DataLayerMap, project?: Project | Observable<Project>, grantedOnly = false): Observable<DataLayerMap> {
    return this.projectOrUserPermissions(project).pipe(
      map(permissions => dataLayers.applyAccess(permissions, grantedOnly))
    );
  }

  datasetWithAccess$(dataset: Dataset, project?: Project | Observable<Project>, grantedOnly = false): Observable<Dataset> {
    return this.projectOrUserPermissions(project).pipe(
      map(permissions => datasetWithAccess(dataset, permissions, grantedOnly))
    );
  }

  filterLayersByPermissions(layers: DataLayer[], project?: Project | Observable<Project>): Observable<DataLayer[]> {
    return this.projectOrUserPermissions(project).pipe(
      map((permissions: string[]) => {
        const perms = new Set(permissions);
        return layers.filter(layer => {
          if ( !!layer && !!layer.access) {return perms.has(layer.access);}
        });
      })
    );
  }

  private projectOrUserPermissions(project: Project | Observable<Project>): Observable<string[]> {
    return project
      ? this.ensureProjectObservable(project).pipe(
          distinctProjectByProjectAppSubscriptionType('prospect'),
          switchMap(p => this.store.pipe(selectProjectPermissions(p)))
        )
      : this.store.pipe(selectUserPermissions);
  }

  private ensureProjectObservable(project: Project | Observable<Project>): Observable<Project> {
    return isObservable(project) ? project : of(project);
  }

}
