import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { filter, map } from 'rxjs/operators';


import { OpenContentLockedDialog, OPEN_CONTENT_LOCKED_DIALOG } from '../actions/dialog.actions';
import { ContentLockedDialogComponent } from '../dialogs/content-locked-dialog/content-locked-dialog.component';


@Injectable()
export class DialogEffects {
  @Effect({ dispatch: false})
  openContentLockedDialog$ = this.actions$.pipe(
    ofType<OpenContentLockedDialog>(OPEN_CONTENT_LOCKED_DIALOG),
    filter(action => action.payload === 'compareTool'),
    map(action => {
      const data = {dialog: action.payload};
      this.dialog.open(ContentLockedDialogComponent, { data });
    })
  );

  constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
  ) {}
}
