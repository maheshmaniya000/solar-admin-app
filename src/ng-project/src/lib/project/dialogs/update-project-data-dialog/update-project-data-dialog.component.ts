import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, pairwise } from 'rxjs/operators';

import { EnergySystemRef } from '@solargis/types/project';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { DataUpdate } from '../../actions/project-data.actions';
import { selectProjectById, State } from '../../reducers';
import { getProjectProgress } from '../../reducers/projects.reducer';

@Component({
  selector: 'sg-update-project-data-dialog',
  templateUrl: './update-project-data-dialog.component.html',
  styleUrls: ['./update-project-data-dialog.component.scss']
})
export class UpdateProjectDataDialogComponent extends SubscriptionAutoCloseComponent implements OnInit {
  updateInProgress = false;

  constructor(
    private readonly router: Router,
    private readonly store: Store<State>,
    readonly dialogRef: MatDialogRef<UpdateProjectDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly systemRef: EnergySystemRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.store
        .pipe(
          selectProjectById(this.systemRef.projectId),
          map(project => getProjectProgress(project).updateData),
          pairwise()
        )
        .subscribe(([prev, current]) => {
          if (!prev && current) {
            this.updateInProgress = true;
          } else if (prev && !current) {
            this.close();
          }
        })
    );
  }

  recalculateProject(): void {
    this.store.dispatch(new DataUpdate({ ...this.systemRef, updateOpts: { operation: 'refresh' } }));
  }

  redirectToReports(): void {
    this.router.navigate(['/detail', this.systemRef.projectId, 'reports']);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
