import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, merge } from 'rxjs';
import { filter, map, pairwise, switchMap, tap, } from 'rxjs/operators';

import { UpdateProjectOpts } from '@solargis/types/project';
import { TranslationDef } from '@solargis/types/translation';
import { capitalize } from '@solargis/types/utils';

import { AddAlert, CloseAlerts, CloseProjectAlerts } from 'ng-shared/core/actions/alerts.actions';
import { OpenUpdateProjectDataDialog } from 'ng-shared/core/actions/dialog.actions';
import { Alert, createAlert } from 'ng-shared/core/types';
import { TranslationSnackbarComponent } from 'ng-shared/shared/components/translation/translation-snackbar.component';
import { selectIsFreetrialToClaimAndLicenseNotExpired } from 'ng-shared/user/selectors/company.selectors';

import { selectSelectedEnergySystemProject } from '../../project-detail/selectors';
import { selectSelectedProject } from '../../project-list/selectors';
import { getProjectDefaultEnergySystemRef } from '../../project-list/utils/project.utils';
import { DataLoaded, DataUpdated, PROJECT_DATA_LOADED, PROJECT_DATA_UPDATED } from '../actions/project-data.actions';
import {
  BulkDeleted,
  BulkUpdated,
  Deleted,
  PROJECT_BULK_DELETED,
  PROJECT_BULK_UPDATED,
  PROJECT_DELETED,
  PROJECT_SAVED,
  PROJECT_UPDATED,
  Saved,
  Updated, UpdateMetadataStatus
} from '../actions/project.actions';
import { ClaimTrialDialogComponent } from '../dialogs/claim-trial-dialog/claim-trial-dialog.component';
import { ProjectNamePipe } from '../pipes/project-name.pipe';
import { State } from '../reducers';
import { getProjectApps, getProjectMetadataStatus } from '../reducers/projects.reducer';
import { selectProject } from '../selectors/project.selectors';
import { distinctProjectByIdAndLatestDataStatus } from '../utils/distinct-project.operator';
import { isFreetrialClaimUpdate, isProjectEligibleToClaimFreetrial } from '../utils/project-freetrial.utils';

function updateToAction(update: UpdateProjectOpts, projects = 1): string {
  let action = 'update';
  if (update.name) {action = 'rename';}
  if (update.status && update.status === 'archived') {action = 'archive';}
  if (Object.prototype.hasOwnProperty.call(update, 'company')) {action = 'transfer';}
  if (isFreetrialClaimUpdate(update)) {action = 'freetrialClaim';}
  return projects > 1 ? `bulk${capitalize(action)}` : action;
}

@Injectable()
export class ProjectNotificationEffects {

  @Effect({ dispatch: false })
  snackBar$ = merge(
    this.actions$.pipe(
      ofType<Saved>(PROJECT_SAVED),
      map(action => ({
        action: 'save',
        project: action.payload.newProject
      }))
    ),
    this.actions$.pipe(
      ofType<Updated>(PROJECT_UPDATED),
      map(action => action.payload),
      filter(({ update }) => !update.site), // ignore site changes
      map(({ update, updatedProject }) => ({
        action: updateToAction(update),
        project: updatedProject
      }))
    ),
    this.actions$.pipe(
      ofType<Deleted>(PROJECT_DELETED),
      map(() => ({ action: 'delete', project: undefined }))
    ),
    this.actions$.pipe(
      ofType<DataUpdated>(PROJECT_DATA_UPDATED),
      map(action => ({
        action: 'updateData',
        project: action.payload
      }))
    )
  ).pipe(
    map(({ action, project }) => ({
      translate: `project.snackbar.${action}`,
      translateParams: {
        projectName: this.projectNamePipe.transform(project)
      }
    } as TranslationDef)),
    tap(data => this.snackBar.openFromComponent(TranslationSnackbarComponent, { data, duration: 3000 }))
  );

  @Effect({ dispatch: false })
  bulkSnackBar$ = merge(
    this.actions$.pipe(
      ofType<BulkUpdated>(PROJECT_BULK_UPDATED),
      map(({ payload: { update, _id } }) => ({
        action: updateToAction(update, _id.length),
        projects: _id.length
      }))
    ),
    this.actions$.pipe(
      ofType<BulkDeleted>(PROJECT_BULK_DELETED),
      map(({ payload: _id }) => ({
        action: 'bulkDelete',
        projects: _id.length
      }))
    )
  ).pipe(
    map(({ action, projects }) => ({
      translate: `project.snackbar.${action}`,
      translateParams: { projects }
    } as TranslationDef)),
    tap(data => this.snackBar.openFromComponent(TranslationSnackbarComponent, { data, duration: 3000 }))
  );

  projectAlerts: Alert[] = [];

  @Effect()
  handleAlerts$ = merge(
    this.actions$.pipe(
      ofType<DataLoaded>(PROJECT_DATA_LOADED),
      map(action => action.payload),
      switchMap(projectDataLoaded => this.store.pipe(selectProject(projectDataLoaded.projectId)))
    ),
    this.actions$.pipe(
      ofType<Updated>(PROJECT_UPDATED),
      map(action => action.payload),
      map(({ updatedProject }) => updatedProject)
    )
  ).pipe(
    switchMap(project =>
      this.store.pipe(selectIsFreetrialToClaimAndLicenseNotExpired).pipe(
        map(hasTrialToClaim => {
          const createdAlerts: Alert[] = [];

          if (hasTrialToClaim && isProjectEligibleToClaimFreetrial(project)) {
            createdAlerts.push(
              createAlert({
                severity: 'info',
                text: 'common.alert.freetrial.available',
                click: {
                  text: 'common.alert.freetrial.availableAction',
                  clickFn: () => {
                    this.dialog.open(ClaimTrialDialogComponent, { data: { project } });
                  }
                },
                routes: ['prospect/detail']
              })
            );
          }
          return createdAlerts;
        }),
        switchMap(alertsToCreate => {
          const actions = alertsToCreate.map(a => new AddAlert(a));
          if (this.projectAlerts.length) {
            const alertsToDelete = new CloseAlerts(this.projectAlerts);
            this.projectAlerts = alertsToCreate;
            return [alertsToDelete, ...actions];
          } else {
            this.projectAlerts = alertsToCreate;
            return actions;
          }
        })
      )
    )
  );

  @Effect()
  projectDataUpdateNotification$ = combineLatest([
    this.store.pipe(selectSelectedProject),
    this.store.pipe(selectSelectedEnergySystemProject)
  ]).pipe(
    map(([listProject, detailProject]) => (detailProject ? detailProject : listProject)),
    distinctProjectByIdAndLatestDataStatus(),
    pairwise(),
    switchMap(([previous, current]) => [
      ...(previous ? [new CloseProjectAlerts(previous._id)] : []),
      ...getProjectApps(current)
        .filter(app => {
          const projectMetadataStatus = getProjectMetadataStatus(current, app);
          return projectMetadataStatus.latest === false && !projectMetadataStatus.dismissed;
        })
        .map(
          app => new AddAlert(
            createAlert({
              severity: 'info',
              text: 'project.updateProjectDialog.nonUpdateData',
              click: {
                text: 'project.action.updateProjectData',
                dispatchOnClick: new OpenUpdateProjectDataDialog(getProjectDefaultEnergySystemRef(current, app))
              },
              secondaryClick: {
                text: 'common.action.moreInfo',
                href: 'https://solargis.com/release-notes/all/prospect-imaps-pvplanner'
              },
              closeClick: {
                text: 'common.action.close',
                dispatchOnClick: new UpdateMetadataStatus([{ projectId: current._id, app, dismissed: true }])
              },
              routes: ['prospect/map', 'prospect/list', 'prospect/detail'],
              projectId: current._id
            })
          )
        )
    ])
  );

  constructor(
    private readonly actions$: Actions,
    private readonly snackBar: MatSnackBar,
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly dialog: MatDialog,
    private readonly store: Store<State>
  ) {}
}


