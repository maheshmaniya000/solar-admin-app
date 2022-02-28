import { Injectable } from '@angular/core';
import { Router, CanActivateChild, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DetailRoute } from '../detail.routes';
import { DetailRouteService } from '../services/detail-route.service';

/**
 * Check if user has permission to access a route
 */
@Injectable()
export class DetailRouteGuard implements CanActivateChild {

  constructor(
    private readonly auth: DetailRouteService,
    private readonly router: Router,
  ) {}

  canActivateChild(childRoute: ActivatedRouteSnapshot): Observable<boolean> {
    const route = childRoute.routeConfig as DetailRoute;

    return this.auth.isRouteAllowed(route).pipe(
      map(access => {
        if (!access) {
          this.router.navigate(['detail']);
        } else {
          return access;
        }
      })
    );
  }
}
