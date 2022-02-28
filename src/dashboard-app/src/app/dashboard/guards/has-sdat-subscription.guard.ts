import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { State } from 'ng-shared/user/reducers';
import { selectHasAppSubscription } from 'ng-shared/user/selectors/company.selectors';

/**
 * Check if company has SDAT subscription
 */
@Injectable()
export class HasSDATSubscriptionGuard implements CanActivate {
  constructor(private readonly store: Store<State>) {}

  canActivate(): Observable<boolean> {
    return this.store.pipe(selectHasAppSubscription('sdat'));
  }
}
