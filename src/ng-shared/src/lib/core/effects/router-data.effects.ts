import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Effect } from '@ngrx/effects';
import { defer } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { RouteDataChanged } from '../actions/route-data.actions';

@Injectable()
export class RouteDataEffects {

  // route to ActivatedRoute effect
  // https://gist.github.com/alexbyk/0801373112b64bd171721c4b6b23e9e2

  @Effect()
  init$ = defer(() => this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.routerState.root),
      map(route => {
        while (route.firstChild) {route = route.firstChild;}
        return route;
      }),
      map(route => new RouteDataChanged(route.snapshot.data)))
    );

  constructor(private readonly router: Router) {}

}
