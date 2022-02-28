import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';

import { State } from 'ng-project/project-detail/reducers';
import { selectSelectedEnergySystemProject } from 'ng-project/project-detail/selectors';
import { SaveSite } from 'ng-project/project/actions/project.actions';
import { ExtendedProject } from 'ng-project/project/reducers/projects.reducer';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

/**
 * This guard checks if the project is saved
 * If not, shows dialog to save project or cancel action
 */
@Injectable()
export class UnsavedProjectGuard implements CanActivate {

  constructor(
    private readonly store: Store<State>,
    private readonly dialog: MatDialog
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.pipe(
      selectSelectedEnergySystemProject,
      first(),
      switchMap((project: ExtendedProject) => {
        if (project && project.status === 'temporal') {
          return this.dialog.open(
              ConfirmationDialogComponent, {
                data: {
                  heading: 'projectDetail.unsavedProjectDialog.heading',
                  text: 'projectDetail.unsavedProjectDialog.body',
                  action: 'projectDetail.unsavedProjectDialog.action',
                },
                maxWidth: 500
              }
            ).afterClosed().pipe(
            switchMap(result => {
              if (result) {
                this.store.dispatch(new SaveSite(project._id));
              }
              // user will be rerouted in project-detail Effects
              // this action is handled by store, so we cannot redirect here after save
              return of(result);
            }),
          );
        } else {
          return of(true);
        }
      })
    );
  }
}
