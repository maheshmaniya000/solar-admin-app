import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { AnalyticsService } from '@solargis/ng-analytics';
import { Project } from '@solargis/types/project';
import { AppSubscriptionType } from '@solargis/types/user-company';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';

import { Update } from '../../actions/project.actions';
import { State } from '../../reducers';

/**
 * Popup dialog for claiming of free trial to project
 */
@Component({
  templateUrl: './claim-trial-dialog.component.html',
  styleUrls: ['./claim-trial-dialog.component.scss']
})
export class ClaimTrialDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ClaimTrialDialogComponent>,
    private readonly store: Store<State>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private readonly analytics: AnalyticsService
  ) {}

  activate(): void {
    this.store.dispatch(new Update({
      _id: this.data.project._id,
      app: {
        prospect: {
          // hardcoded for now
          subscription: AppSubscriptionType.ProspectFreeTrial
        }
      }
    }));
    this.analytics.trackEvent('SIGNUP', 'FREETRIAL-SG2');
    this.store.dispatch(new AmplitudeTrackEvent('free_trial_claimed', { projectIds: [ this.data.project._id ]}));
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
