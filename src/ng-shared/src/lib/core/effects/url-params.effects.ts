import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Params, Router, UrlSerializer } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { defer, merge, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AFTER_BOOTSTRAP } from '../actions/bootstrap.action';
import {
  UrlParamsAction, UrlParamsInit, UrlParamsPopState,
  URL_PARAMS_INIT, URL_PARAMS_POP_STATE, URL_PARAMS_SYNC
} from '../actions/url-params.actions';
import { State } from '../reducers';

@Injectable()
export class UrlParamsEffects {

  @Effect()
  initAfterBootstrap$ = this.actions$.pipe(
    ofType(AFTER_BOOTSTRAP),
    first(),
    map(() => this.resolveParams()),
    map(params => new UrlParamsInit(params))
  );

  @Effect({ dispatch: false })
  initLocationPopState$ = defer(() => {
    this.location.onPopState(() => {
      const params = this.resolveParams();
      this.store.dispatch(new UrlParamsPopState(params));
    });
  });

  navigating$ = this.router.events.pipe(
    filter(event =>
      event instanceof NavigationStart
      || event instanceof NavigationEnd
      || event instanceof NavigationCancel
      || event instanceof NavigationError
    ),
    map(event => event instanceof NavigationStart),
    distinctUntilChanged()
  );

  @Effect({ dispatch: false })
  syncToUrl$ = this.actions$.pipe(
    ofType(URL_PARAMS_SYNC),
    withLatestFrom(this.store.select('urlParams'), (action, params) => params),
    filter(params => !!params),
    distinctUntilChanged((params1, params2) => isEqual(params1, params2)),
    // wait until router navigation is finished
    withLatestFrom(this.navigating$),
    switchMap(([params, navigating]) =>
      navigating
        ? this.navigating$.pipe(filter(nav => !nav), first(), map(() => params))
        : of(params)
    ),
    tap(queryParams => this.router.navigate([], { queryParams }))
  );

  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly store: Store<State>,
    private readonly location: PlatformLocation,
    private readonly urlSerializer: UrlSerializer
  ) {}

  private resolveParams(): Params {
    const search = this.location.search;
    return search ? this.urlSerializer.parse(search).queryParams : {};
  }
}

export const urlParamsInit$ = (store: Store<State>, actions$: Actions): Observable<Params> =>
  merge(
    defer(() => of(true)),
    actions$.pipe(ofType<UrlParamsAction>(URL_PARAMS_INIT, URL_PARAMS_POP_STATE))
  ).pipe(
    withLatestFrom(store.select('urlParams'), (action, params) => params),
    debounceTime(10)
  );
