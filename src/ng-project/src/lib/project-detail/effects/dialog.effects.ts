import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, withLatestFrom } from 'rxjs/operators';

import { isProspectSubscriptionExpired } from '@solargis/types/user-company';

import { OPEN_CONTENT_LOCKED_DIALOG, OpenContentLockedDialog } from 'ng-shared/core/actions/dialog.actions';
import { ContentLockedDialogComponent } from 'ng-shared/core/dialogs/content-locked-dialog/content-locked-dialog.component';
import {
  selectActiveOrNoCompany,
  selectIsFreetrialActive,
  selectIsFreetrialToClaimAndLicenseNotExpired
} from 'ng-shared/user/selectors/company.selectors';

import { State } from '../../project/reducers';
import { getEnergySystem } from '../../project/utils/map-default-energy-system.operator';
import { isFreetrialProject } from '../../project/utils/project-freetrial.utils';
import { selectSelectedEnergySystemProject } from '../selectors/selected-energy-system.selector';


@Injectable()
export class DialogEffects {

  @Effect({ dispatch: false })
  openContentLockedDialog$ = this.actions$.pipe(
    ofType<OpenContentLockedDialog>(OPEN_CONTENT_LOCKED_DIALOG),
    filter(action => action.payload !== 'compareTool'),
    withLatestFrom(
      this.store.pipe(selectSelectedEnergySystemProject),
      this.store.pipe(selectIsFreetrialToClaimAndLicenseNotExpired),
      this.store.pipe(selectActiveOrNoCompany),
      this.store.pipe(selectIsFreetrialActive)
    ),
    map(([action, selectedEnergySystemProject, isFreetrialToClaimAndLicenseNotExpired, activeOrNoCompany, isFreeTrialActive]) => {
      let data;
      if (action.payload === 'pvConfig') {
        const projectEnergySystemRef = getEnergySystem(selectedEnergySystemProject, 'prospect');
        data = {
          dialog: action.payload,
          projectId: projectEnergySystemRef.projectId
        };
      } else {
        const showRequestFreeTrial = !!activeOrNoCompany && (!activeOrNoCompany?.prospectLicense ||
          isProspectSubscriptionExpired(activeOrNoCompany?.prospectLicense));
        const showFreeTrial = isFreeTrialActive && !isFreetrialProject(selectedEnergySystemProject) &&
          isFreetrialToClaimAndLicenseNotExpired;
        data = {
          dialog: action.payload,
          showFreeTrial,
          showRequestFreeTrial: showRequestFreeTrial && !showFreeTrial,
          project: selectedEnergySystemProject,
        };
      }
      this.dialog.open(ContentLockedDialogComponent, { data });
    })
  );

  constructor(private readonly actions$: Actions, private readonly dialog: MatDialog, private readonly store: Store<State>) { }
}
