import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, delay } from 'rxjs/operators';

import { State } from '../reducers';
import { selectActiveCompanyToken } from '../selectors/company.selectors';

// TODO move to user guards
/**
 * Check if user has selected a company
 */
@Injectable()
export class HasSelectedCompanyGuard implements CanActivate {

  constructor(
    private readonly store: Store<State>,
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.pipe(
      selectActiveCompanyToken,
      map(x => !!x),
      // if no company, just wait 3 seconds and retry
      // the companies might be still loading
      // TODO: add status handling in ngrx state (retry operator?)
      switchMap(check => {
        if (check) {return of(check);}
        else {return of(check).pipe(
          delay(3000),
          switchMap(() => this.store.pipe(selectActiveCompanyToken)),
          map(x => !!x)
        );}
      }),
    );
  }
}
