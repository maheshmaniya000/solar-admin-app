import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { State } from 'ng-shared/user/reducers';
import { selectUser } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { isCompanyAdmin } from 'ng-shared/user/utils/company.utils';


/**
 * Check if user has admin access
 */
@Injectable()
export class IsCompanyAdminGuard implements CanActivate {

  constructor(
    private readonly store: Store<State>
  ) {}

  canActivate(): Observable<boolean> {
    return combineLatest([
      this.store.pipe(selectActiveOrNoCompany),
      this.store.pipe(selectUser)
    ]).pipe(
      filter(([company]) => !!company),
      map(([company, user]) => isCompanyAdmin(company, user)),
    );
  }

}
