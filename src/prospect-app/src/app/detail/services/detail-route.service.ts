import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PvConfigStatus } from '@solargis/types/pv-config';

import { selectSelectedEnergySystem, selectSelectedEnergySystemProject } from 'ng-project/project-detail/selectors';
import { State } from 'ng-project/project/reducers';
import { mapPvConfigStatus } from 'ng-project/project/utils/map-pv-config-status.operator';
import { selectProjectPermissions } from 'ng-shared/user/selectors/permissions.selectors';
import { hasPermissionForRoute } from 'ng-shared/user/utils/route-permissions.utils';

import { DetailRoute, routes as detailRoutes } from '../detail.routes';

function requiresPvConfig(route: DetailRoute): boolean {
  const parent = detailRoutes.find(r => r.path === route.data.parent);
  return (route.data.requiresPvConfig) ||
    (parent && parent.data.requiresPvConfig);
}

function hasPvConfig(route: DetailRoute, pvConfigStatus: PvConfigStatus): boolean {
  if (requiresPvConfig(route)) {
    return pvConfigStatus && pvConfigStatus === 'hasPvSystem';
  } else {
    return true;
  }
}

@Injectable()
export class DetailRouteService {

  constructor(private readonly store: Store<State>) {
  }

  filterAllowedRoutes(routes: DetailRoute[]): Observable<DetailRoute[]> {
    return of(routes).pipe(
      // check permissions
      switchMap(allowedRoutes => this.filterRoutesWithPermissions(allowedRoutes)),
      // check PvConfig
      switchMap(filteredRoutes =>
        this.store.pipe(
          selectSelectedEnergySystem,
          mapPvConfigStatus(),
          map(pvConfigStatus => filteredRoutes.filter(r => hasPvConfig(r, pvConfigStatus)))
        )
      ),
    );
  }

  isRouteAllowed(route: DetailRoute): Observable<boolean> {
    return this.filterAllowedRoutes([route]).pipe(
      map(result => result && result.length === 1 && result[0].path === route.path)
    );
  }

  filterRoutesWithPermissions(routes: DetailRoute[]): Observable<DetailRoute[]> {
    return of(routes).pipe(switchMap(filteredRoutes =>
        this.store.pipe(
          selectSelectedEnergySystemProject,
          switchMap(project => this.store.pipe(selectProjectPermissions(project))),
          map(permissions => filteredRoutes.filter(r =>
            hasPermissionForRoute(r, detailRoutes, permissions))
          )
        )
      )
    );
  }
}
