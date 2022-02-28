import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { EnergySystemRef } from '@solargis/types/project';

import {
  OpenActivateFreeTrialDialog,
  OpenUpdateProjectDataDialog,
  OPEN_ACTIVATE_FREE_TRIAL_DIALOG,
  OPEN_UPDATE_PROJECT_DATA_DIALOG
} from 'ng-shared/core/actions/dialog.actions';

import { Export, PROJECT_EXPORT } from '../actions/project.actions';
import { ClaimTrialDialogComponent } from '../dialogs/claim-trial-dialog/claim-trial-dialog.component';
import { UpdateProjectDataDialogComponent } from '../dialogs/update-project-data-dialog/update-project-data-dialog.component';
import { State } from '../reducers';
import { Sg1FtpExportProjectsService } from '../services/sg1-ftp-export-projects.service';
import { exportProjectsOperator } from '../utils/export-projects.operator';

@Injectable()
export class DialogEffects {

  @Effect({dispatch: false})
  openActivateFreeTrialDialog$ = this.actions$.pipe(
    ofType<OpenActivateFreeTrialDialog>(OPEN_ACTIVATE_FREE_TRIAL_DIALOG),
    map(action => {
      const { payload: project } = action;
      this.dialog.open(ClaimTrialDialogComponent, { data: { project } });
    })
  );

  @Effect()
  exportProjectDialog$ = this.actions$.pipe(
    ofType<Export>(PROJECT_EXPORT),
    map(action => [[], action.payload]),
    exportProjectsOperator(this.dialog, this.exportService)
  );

  @Effect({dispatch: false})
  openUpdateProjectDataDialog$ = this.actions$.pipe(
    ofType<OpenUpdateProjectDataDialog>(OPEN_UPDATE_PROJECT_DATA_DIALOG),
    map(action => this.dialog
      .open<UpdateProjectDataDialogComponent, EnergySystemRef>(UpdateProjectDataDialogComponent, { data: action.payload })
    ),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly store: Store<State>,
    private readonly exportService: Sg1FtpExportProjectsService
  ) {}
}
