import { Injectable, Inject } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import { Config } from 'ng-shared/config';

import { USER_LOGOUT, UserLogout } from '../../user/actions/auth.actions';


@Injectable()
export class RouteEffects {

  /**
   * After user loggs out, redirect to map
   */
  @Effect({ dispatch: false })
  clearResults$ = this.actions$.pipe(
    ofType<UserLogout>(USER_LOGOUT),
    tap(() => {
      this.window.location.href = this.config.apps.dashboard.url;
    })
  );

  constructor(
    @Inject('Window') private readonly window,
    private readonly actions$: Actions,
    private readonly config: Config
    ) {}
}
