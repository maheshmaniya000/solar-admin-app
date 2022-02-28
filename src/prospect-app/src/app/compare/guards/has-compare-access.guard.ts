import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { OpenContentLockedDialog } from 'ng-shared/core/actions/dialog.actions';
import { State } from 'ng-shared/core/reducers';
import { selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';
import { selectHasUserCompareAccessAndToken } from 'ng-shared/user/selectors/permissions.selectors';

@Injectable()
export class HasCompareAccessGuard implements CanActivate {
  constructor(private readonly store: Store<State>) {}

  canActivate(): Observable<boolean> {
    const isUserLogged$ = this.store.pipe(selectIsUserLogged);
    const hasUserCompareAccess$ = this.store.pipe(
      selectHasUserCompareAccessAndToken
    );

    return combineLatest([isUserLogged$, hasUserCompareAccess$]).pipe(
      tap(([isUserLogged, hasUserCompareAccess]) => {
        if (
          !!isUserLogged &&
          !hasUserCompareAccess.hasUserCompare &&
          hasUserCompareAccess.hasCompanyToken
        ) {
          this.store.dispatch(new OpenContentLockedDialog('compareTool'));
        }
      }),
      map(([, hasUserCompareAccess]) => hasUserCompareAccess.hasUserCompare)
    );
  }
}
