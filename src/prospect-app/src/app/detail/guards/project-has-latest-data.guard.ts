import { Inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { SolargisApp } from '@solargis/types/user-company';

import { selectSelectedEnergySystemRef } from 'ng-project/project-detail/selectors';
import { State } from 'ng-project/project/reducers';
import { ensureSelectedEnergySystemHasLatestData } from 'ng-project/utils/latest-data.utils';
import { APP_TOKEN } from 'ng-shared/core/tokens';

/**
 * Prevent navigation when project is not up-to-date
 */
@Injectable()
export class ProjectHasLatestDataGuard implements CanActivate {
  constructor(
    private readonly store: Store<State>,
    @Inject(APP_TOKEN) private readonly app: SolargisApp,
    private readonly router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return ensureSelectedEnergySystemHasLatestData(this.store, this.app).pipe(
      switchMap(isLatest => {
        if (isLatest) {
          return of(true);
        } else if (this.router.isActive('/detail', false)) {
          return of(false);
        }
        return this.store.pipe(
          selectSelectedEnergySystemRef,
          map(energySys => this.router.parseUrl(`/detail/${energySys.projectId}`))
        );
      })
    );
  }
}
