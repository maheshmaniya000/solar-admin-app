import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, race } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { fromAdmin } from '../../store';
import { Users } from '../constants/users.constants';
import { UsersActions, UsersSelectors } from '../store';

@Injectable({
  providedIn: 'root'
})
export class UserDetailGuard implements CanActivate {
  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly router: Router,
    private readonly actions$: Actions
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const sgAccountId = route.paramMap.get(Users.accountIdRouteParamName);
    this.store.dispatch(UsersActions.loadDetail({ sgAccountId }));
    return race(
      this.store.select(UsersSelectors.selectDetail).pipe(
        filter(user => user?.sgAccountId === sgAccountId),
        map(() => true)
      ),
      this.actions$.pipe(
        ofType(UsersActions.loadDetailFailure),
        filter(failedSgAccountId => failedSgAccountId === failedSgAccountId),
        map(() => this.router.createUrlTree(['list', 'users']))
      )
    ).pipe(first());
  }
}
