import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { UpdateUserSettings } from 'ng-shared/user/actions/auth.actions';
import { selectUserData } from 'ng-shared/user/selectors/auth.selectors';

import { AdminActions, fromAdmin } from './index';

@Injectable()
export class AdminEffects {
  showSnackbar$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AdminActions.showSnackbar),
        tap(action =>
          this.snackBar.open(action.message, null, {
            duration: action.duration ?? 3000,
            panelClass: [action.styleClass, 'snackbarTextCenter']
          })
        )
      ),
    { dispatch: false }
  );

  updateTableColumnsSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateColumnsSettings),
      withLatestFrom(this.store.pipe(selectUserData)), // FIXME previous state should be merged in reducer
      map(
        ([action, user]) =>
          new UpdateUserSettings({
            tableView: {
              [action.table]: {
                ...user?.settings?.tableView?.[action.table],
                columns: action.columns
              }
            }
          })
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly snackBar: MatSnackBar, private readonly store: Store<fromAdmin.State>) {}
}
