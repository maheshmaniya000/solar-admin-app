import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { NOT_FOUND } from 'http-status-codes';
import { combineLatest, forkJoin, Observable, of, OperatorFunction, pipe } from 'rxjs';
import { catchError, concatMap, delay, filter, first, map, mergeMap, switchMap } from 'rxjs/operators';

import { DataResolution, UpdateProjectDataOpts, VersionedDatasetDataMap } from '@solargis/types/dataset';
import { EnergySystem, EnergySystemRef, getAppSystemId, hasPvConfig, Project } from '@solargis/types/project';
import { LatLng, latlngToUrlParam } from '@solargis/types/site';
import { removeEmpty } from '@solargis/types/utils';

import { Config } from 'ng-shared/config';
import { FUPHttpClientService } from 'ng-shared/fup/services/fup-http-client.service';
import { selectUserPermissions } from 'ng-shared/user/selectors/permissions.selectors';

import {
  DataClear,
  DataError,
  DataLoad,
  DataLoaded,
  DataNotFound,
  DataUpdate,
  DataUpdated,
  PROJECT_DATA_LOAD,
  PROJECT_DATA_LOADED,
  PROJECT_DATA_UPDATE
} from '../actions/project-data.actions';
import { AddProject, Load, PROJECT_ADD, UpdateMetadataStatus } from '../actions/project.actions';
import { selectProjectById, State } from '../reducers';
import { selectAppMetadata } from '../selectors/metadata.selectors';
import { selectEnergySystem } from '../selectors/project.selectors';
import { calculateProjectMetadataStatus } from './project-api.effects';

@Injectable()
export class ProjectDataApiEffects {
  @Effect()
  loadTemporalProjectData$ = combineLatest([
    this.actions$.pipe(
      ofType<AddProject>(PROJECT_ADD),
      map(action => action.payload),
      filter(project => !project.created)
    ),
    this.store.pipe(selectUserPermissions, delay(0)) // reload on permissions change
  ]).pipe(
    switchMap(([project,]) => this.store.pipe(selectProjectById(project._id), first())), // reload actual project
    filter(project => !!project), // ignore if project is removed/replaced
    switchMap(project => {
      const systemRef = { projectId: project._id, app: 'prospect' } as EnergySystemRef;
      return [new DataClear(systemRef), new DataLoad(systemRef)];
    })
  );

  @Effect()
  loadProjectData$ = this.actions$.pipe(
    ofType<DataLoad>(PROJECT_DATA_LOAD),
    this.ensureProjectInStoreOrActionHasProjectId(),
    mergeMap(([action, project]) => {
      const { projectId, app, systemId, resolution } = action.payload;
      const systemRef: EnergySystemRef = removeEmpty({ projectId, app, systemId });
      const data$ =
        project && !project.created
          ? this.ltaData$(project.site.point) // unsaved project, prospect lta only (pvcalcDetails?)
          : this.projectData$(systemRef, resolution);
      return data$.pipe(
        map(dataset => dataset
          ? new DataLoaded({ ...systemRef, dataset })
          : new DataClear(systemRef)
        ),
        catchError(err => this.handleError(err, systemRef))
      );
    })
  );

  @Effect()
  updateProjectData$ = this.actions$.pipe(
    ofType<DataUpdate>(PROJECT_DATA_UPDATE),
    this.ensureProjectInStoreOrActionHasProjectId(),
    mergeMap(([action, project]) => {
      const { projectId, app, systemId, updateOpts } = action.payload;
      const systemRef: EnergySystemRef = removeEmpty({ projectId, app, systemId });
      return this.updateData$(systemRef, updateOpts).pipe(
        mergeMap(datasets => [
          ...datasets.map(dataset => new DataLoaded({ ...systemRef, dataset })),
          new DataUpdated(project),
          new Load(systemRef.projectId)
        ]),
        catchError(err => this.handleError(err, systemRef))
      );
    })
  );

  @Effect()
  updateIsLatest$ = combineLatest([
    this.actions$.pipe(ofType<DataLoaded>(PROJECT_DATA_LOADED)),
    this.store.select(selectAppMetadata('prospect')).pipe(filter(metadata => !!metadata))
  ]).pipe(
    concatMap(([projectDataLoadedAction, metadata]) =>
      calculateProjectMetadataStatus(projectDataLoadedAction.payload, metadata, this.store)),
    map(updateMetadataStatusPayload => new UpdateMetadataStatus([updateMetadataStatusPayload]))
  );

  constructor(
    private readonly actions$: Actions,
    private readonly fupHttpClient: FUPHttpClientService,
    private readonly http: HttpClient,
    private readonly store: Store<State>,
    private readonly config: Config
  ) { }

  private ltaData$(point: LatLng): Observable<VersionedDatasetDataMap> {
    const loc = latlngToUrlParam(point);
    return this.fupHttpClient.get('/api/data/lta', { params: { loc } }).pipe(map(lta => ({ lta })));
  }

  private projectData$(
    systemRef: EnergySystemRef,
    resolution: DataResolution | DataResolution[]
  ): Observable<VersionedDatasetDataMap | undefined> {
    const { projectId, app, systemId } = systemRef;
    const appSystemId = getAppSystemId({ app, systemId });
    const params = removeEmpty({ resolution });

    return this.store.pipe(
      selectEnergySystem(systemRef),
      first(),
      switchMap(energySystem => !systemId || hasPvConfig(energySystem as EnergySystem)
        ? this.fupHttpClient.get(`${this.config.api.projectUrl}/${projectId}/data/${appSystemId}`, { params })
        : of(undefined)
      )
    );
  }

  private updateData$(systemRef: EnergySystemRef, updateOpts: UpdateProjectDataOpts): Observable<VersionedDatasetDataMap[]> {
    const createRequest = (appSystemId: string): Observable<VersionedDatasetDataMap> =>
      this.http.patch<VersionedDatasetDataMap>(`${this.config.api.projectUrl}/${systemRef.projectId}/data/${appSystemId}`, updateOpts);
    const requests = [createRequest(systemRef.app)];
    if (systemRef.systemId) {
      requests.push(createRequest(getAppSystemId(systemRef)));
    }
    return forkJoin(requests);
  }

  private ensureProjectInStoreOrActionHasProjectId<T extends { payload: EnergySystemRef }>(): OperatorFunction<T, [T, Project]> {
    return pipe(
      switchMap<T, Observable<[T, Project]>>(action =>
        this.store.pipe(
          selectProjectById(action.payload.projectId),
          first(),
          map(project => [action, project] as [T, Project])
        )
      ),
      filter(([action, project]) => !!project || !!action.payload.projectId)
    );
  }

  private handleError(err: HttpErrorResponse, systemRef: EnergySystemRef): Observable<DataNotFound | DataError> {
    return of(err.status === NOT_FOUND ? new DataNotFound({ ...systemRef }) : new DataError({ ...systemRef, err }));
  }
}
