import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, forkJoin, from, merge, Observable, of } from 'rxjs';
import { catchError, concatMap, filter, first, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';

import { isLatestDatasetDataMap } from '@solargis/dataset-core';
import { VersionedDatasetMetadataMap } from '@solargis/types/dataset';
import { EnergySystemRef, Project, ProjectId } from '@solargis/types/project';
import { getMeridianTimezone, Site } from '@solargis/types/site';
import { ensureArray, isEmpty } from '@solargis/types/utils';

import { Config } from 'ng-shared/config';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { AmplitudeEventCode } from 'ng-shared/core/services/amplitude-analytics.service';
import { ReloadCompany } from 'ng-shared/user/actions/company.actions';
import { selectActiveOrNoCompany, selectIsCompanyListLoaded } from 'ng-shared/user/selectors/company.selectors';

import { getProjectDefaultEnergySystemRef } from '../../project-list/utils/project.utils';
import {
  BulkDelete,
  BulkDeleted,
  BulkError,
  BulkUpdate,
  BulkUpdated,
  Deleted,
  Error,
  Load,
  Loaded,
  ProjectBulkError,
  ProjectUpdate,
  ProjectUpdateMetadataStatus,
  PROJECT_BULK_DELETE,
  PROJECT_BULK_DELETED,
  PROJECT_BULK_UPDATE,
  PROJECT_BULK_UPDATED,
  PROJECT_DELETE,
  PROJECT_DELETED,
  PROJECT_LOAD,
  PROJECT_LOADED,
  PROJECT_SAVED,
  PROJECT_SAVE_SITE,
  PROJECT_SET_PROJECTS,
  PROJECT_UPDATE, PROJECT_UPDATED,
  RemoveProjects,
  Saved,
  SaveSite,
  SetProjects,
  Update,
  Updated,
  UpdateMetadataStatus
} from '../actions/project.actions';
import { selectProjectById, State } from '../reducers';
import { getAllProjectDataSelector } from '../selectors/energy-system-data.selector';
import { selectAppMetadata } from '../selectors/metadata.selectors';
import { ProjectLoadService } from '../services/project-load.service';
import { isFreetrialClaimUpdate } from '../utils/project-freetrial.utils';

type ProjectSaveResult = { err?: any; temporalId: string; newProject: Project };
type ProjectUpdateResult = { err?: any; update: ProjectUpdate; updatedProject?: Project };

export function calculateProjectMetadataStatus(
  systemRef: EnergySystemRef,
  metadata: VersionedDatasetMetadataMap,
  store: Store<State>
): Observable<ProjectUpdateMetadataStatus> {
  const { projectId, app } = systemRef;
  return store.select(getAllProjectDataSelector(systemRef)).pipe(first(), map(projectData => ({
    projectId,
    app,
    latest: isLatestDatasetDataMap(projectData, metadata)
  })));
}

function ensureSiteWithTimezone(site: Site): Site {
  return site.timezone ? site : { ...site, timezone: getMeridianTimezone(site.point) };
}

function groupMultiStatusErrors(errors): { [_id: string]: ProjectBulkError } {
  return errors.reduce((res, err) => {
    const { _id, ...error } = err || { _id: undefined };
    const code = err.status ? 'ok' : err.code || 'error';
    if (res[code]) { res[code]._id.push(_id); }
    else { res[code] = { _id: [_id], error } as ProjectBulkError; }
    return res;
  }, {});
}

@Injectable()
export class ProjectApiEffects {

  @Effect()
  loadProject$ = this.actions$.pipe(
    ofType<Load>(PROJECT_LOAD),
    map(action => action.payload),
    // wait till company list is loaded
    withLatestFrom(this.store.pipe(selectIsCompanyListLoaded)),
    filter(([, companiesLoaded]) => companiesLoaded),
    map(([projectId,]) => projectId),
    mergeMap(projectId => this.loadService.loadProject(projectId)),
    map(({ err, projectId, project }) => err
      ? new Error({ _id: projectId, status: 'error' })
      : new Loaded(project)
    )
  );

  @Effect()
  saveSiteAsProject$ = this.actions$.pipe(
    ofType<SaveSite>(PROJECT_SAVE_SITE),
    map(action => action.payload),
    switchMap(temporalProjectId => this.store.pipe(selectProjectById(temporalProjectId), first())),
    mergeMap(project => {
      const temporalId = project._id;
      const saveProject = {
        site: ensureSiteWithTimezone(project.site)
      };
      return this.http.post(this.config.api.projectUrl, saveProject).pipe(
        map(newProject => ({ temporalId, newProject })),
        catchError(err => of({ err, temporalId }))
      );
    }),
    switchMap(({ err, temporalId, newProject }: ProjectSaveResult) =>
      err
        ? [new Error({ _id: temporalId, status: 'error' })]
        : [
          new Saved({ temporalId, newProject }),
          new AmplitudeTrackEvent('project_saved', { project: { _id: newProject._id } })
        ]
    )
  );

  @Effect()
  updateProject$ = this.actions$.pipe(
    ofType<Update>(PROJECT_UPDATE),
    switchMap(action =>
      this.store.pipe(
        selectProjectById(action.payload._id),
        first(),
        map(project => [action.payload, project] as [ProjectUpdate, Project])
      )
    ),
    filter(([, project]) => !!project && !!project.created),
    mergeMap(([update,]) => {
      const { _id, ...updateOpts } = update;
      return this.http
        .patch(`${this.config.api.projectUrl}/${_id}`, updateOpts)
        .pipe(
          map(updatedProject => ({ update, updatedProject })),
          catchError(err => of({ err, update }))
        );
    }),
    // @ts-ignore
    switchMap(({ err, update, updatedProject }: ProjectUpdateResult): any => {
      let event: AmplitudeEventCode = 'project_updated';
      if (update.name) { event = 'project_renamed'; }
      else if (update.status === 'archived') { event = 'project_archived'; }
      else if (update.status === 'active') { event = 'project_unarchived'; }
      return err
        ? [new Error({ _id: update._id, status: 'error' }) as any]
        : [
          new Updated({ update, updatedProject }) as any,
          new AmplitudeTrackEvent(event, {
            count: 1,
            projectIds: [updatedProject._id]
          })
        ];
    })
  );

  @Effect()
  deleteProject$ = this.actions$.pipe(
    ofType<Update>(PROJECT_DELETE),
    mergeMap(({ payload: _id }) =>
      this.http.delete(`${this.config.api.projectUrl}/${_id}`).pipe(
        map(() => ({ _id })),
        catchError(err => of({ err, _id }))
      )
    ),
    // @ts-ignore
    switchMap(({ err, _id }: { err?: any; _id: ProjectId }) => err
      ? [new Error({ _id, status: 'error' })]
      : [
        new Deleted(_id),
        new AmplitudeTrackEvent('project_deleted', { projectIds: [_id] })
      ]
    )
  );

  @Effect()
  bulkUpdateProjects$ = this.actions$.pipe(
    ofType<BulkUpdate>(PROJECT_BULK_UPDATE),
    map(action => action.payload),
    mergeMap(bulkUpdate =>
      this.http.patch(this.config.api.projectUrl, bulkUpdate).pipe(
        map(errors => ({ errors, bulkUpdate })),
        catchError(errors => of({ errors, bulkUpdate }))
      )
    ),
    switchMap(({ errors, bulkUpdate }) => {
      const actions = [];
      if (isEmpty(errors)) { // all OK
        actions.push(new BulkUpdated(bulkUpdate));

        if (bulkUpdate.update.status === 'archived') {
          actions.push(new AmplitudeTrackEvent('project_archived', { count: bulkUpdate._id.length, projectIds: bulkUpdate._id }));
        }
        if (bulkUpdate.update.status === 'active') {
          actions.push(new AmplitudeTrackEvent('project_unarchived', { count: bulkUpdate._id.length, projectIds: bulkUpdate._id }));
        }
        if (Object.prototype.hasOwnProperty.call(bulkUpdate.update, 'company')) {
          actions.push(new AmplitudeTrackEvent('project_transfer', { projectIds: bulkUpdate._id }));
        }
      } else if (Array.isArray(errors)) { // multi status
        const errorsByErrorCode = groupMultiStatusErrors(errors);

        Object.keys(errorsByErrorCode).forEach(code => {
          const { _id, error: { status } } = errorsByErrorCode[code];
          if (status) {
            actions.push(new BulkUpdated({ ...bulkUpdate, _id }));
            if (bulkUpdate.update.status === 'archived') {
              actions.push(new AmplitudeTrackEvent('project_archived', { count: bulkUpdate._id.length, projectIds: bulkUpdate._id }));
            }
            if (bulkUpdate.update.status === 'active') {
              actions.push(new AmplitudeTrackEvent('project_unarchived', { count: bulkUpdate._id.length, projectIds: bulkUpdate._id }));
            }
          } else { actions.push(new BulkError(errorsByErrorCode[code])); }
        });

      } else { // all ERROR
        actions.push(new BulkError({ _id: bulkUpdate._id, error: errors }));
      }
      return actions;
    })
  );

  @Effect()
  bulkDeleteProjects$ = this.actions$.pipe(
    ofType<BulkDelete>(PROJECT_BULK_DELETE),
    map(action => action.payload),
    mergeMap(_id =>
      this.http
        .request('delete', this.config.api.projectUrl, {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          body: { _id }
        })
        .pipe(
          map(errors => ({ errors, _id })),
          catchError(errors => of({ errors, _id }))
        )
    ),
    switchMap(({ errors, _id }) => {
      const actions = [];
      if (isEmpty(errors)) { // all OK
        actions.push(new BulkDeleted(_id));
        actions.push(new AmplitudeTrackEvent('project_deleted', { count: _id.length, projectIds: _id }));
      } else if (Array.isArray(errors)) { // multi status
        const errorsByErrorCode = groupMultiStatusErrors(errors);

        Object.keys(errorsByErrorCode).forEach(code => {
          const { _id: projectId, error: { status } } = errorsByErrorCode[code];
          if (status) {
            actions.push(new AmplitudeTrackEvent('project_deleted', { projectIds: projectId, count: projectId.length }));
            actions.push(new BulkDeleted(projectId));
          } else { actions.push(new BulkError(errorsByErrorCode[code])); }
        });
      } else { // all ERROR
        actions.push(new BulkError({ _id, error: errors }));
      }
      return actions;
    })
  );

  @Effect()
  removeDeletedProjects$ = this.actions$.pipe(
    ofType<Deleted | BulkDeleted>(PROJECT_DELETED, PROJECT_BULK_DELETED),
    map(({ payload }) => new RemoveProjects(ensureArray(payload)))
  );

  @Effect()
  transferredProjects$ = merge(
    this.actions$.pipe(
      ofType<Updated>(PROJECT_UPDATED),
      map(({ payload: { update, updatedProject } }) => ({ update, projectIds: [updatedProject._id] }))
    ),
    this.actions$.pipe(
      ofType<BulkUpdated>(PROJECT_BULK_UPDATED),
      map(({ payload: { update, _id } }) => ({ update, projectIds: _id }))
    )
  ).pipe(
    filter(({ update }) => Object.prototype.hasOwnProperty.call(update, 'company')), // isTransfer
    switchMap(({ projectIds }) => {
      if (this.router.url && this.router.url.startsWith('/detail/')) {
        // navigate to map first
        return from(this.router.navigate(['map'])).pipe(map(() => new RemoveProjects(projectIds)));
      } else {
        return of(new RemoveProjects(projectIds));
      }
    })
  );

  @Effect()
  freetrialClaim$ = this.actions$.pipe(
    ofType<Updated>(PROJECT_UPDATED),
    filter(({ payload: { update } }) => isFreetrialClaimUpdate(update)),
    withLatestFrom(this.store.pipe(selectActiveOrNoCompany), (action, company) => company),
    filter(company => !!company),
    map(company => new ReloadCompany(company.sgCompanyId))
  );

  @Effect()
  updateIsLatest$ = combineLatest([
    merge(
      this.actions$.pipe(
        ofType<SetProjects>(PROJECT_SET_PROJECTS),
        map(action => action.payload)
      ),
      this.actions$.pipe(
        ofType<Loaded>(PROJECT_LOADED),
        map(action => [action.payload])
      ),
      this.actions$.pipe(
        ofType<Updated>(PROJECT_UPDATED),
        map(action => [action.payload.updatedProject])
      ),
      this.actions$.pipe(
        ofType<Saved>(PROJECT_SAVED),
        map(action => [action.payload.newProject])
      )
    ),
    this.store.select(selectAppMetadata('prospect')).pipe(filter(metadata => !!metadata))
  ]).pipe(
    concatMap(([projects, metadata]) =>
      forkJoin(projects.map(project =>
        calculateProjectMetadataStatus(getProjectDefaultEnergySystemRef(project, 'prospect'), metadata, this.store))
      )
    ),
    map(payload => new UpdateMetadataStatus(payload))
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly http: HttpClient,
    private readonly loadService: ProjectLoadService,
    private readonly config: Config,
    private readonly router: Router
  ) { }
}

