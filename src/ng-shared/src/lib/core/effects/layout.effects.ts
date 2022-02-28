import { Inject, Injectable, SimpleChange } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { fromEvent, merge, defer, of } from 'rxjs';
import { distinctUntilChanged, map, withLatestFrom, filter, first, flatMap, tap, skip } from 'rxjs/operators';

import { simpleChange } from 'ng-shared/utils/rxjs/simplechange.operator';

import { LAYOUT_DRAWER_TOGGLE, LayoutDrawerStateUpdate, LAYOUT_DRAWER_CLOSE_IF_OVER } from '../actions/layout.actions';
import { State } from '../reducers';
import { LayoutState, DrawerModeState, OpenedClosedState } from '../reducers/layout.reducer';
import { StorageProviderService } from '../services/storage-provider.service';

// TODO: create variables for responsivity
export const DRAWER_BREAKPOINT = 1199;
const LAYOUT_STORAGE_KEY = 'layout';

@Injectable()
export class LayoutEffects {

  storage: Storage;

  @Effect()
  init$ = defer(() => {
    const mode: DrawerModeState = this.window.innerWidth > DRAWER_BREAKPOINT ? 'side' : 'over';
    let toggle: OpenedClosedState = 'opened';

    const jsonState = this.storage.getItem(LAYOUT_STORAGE_KEY);
    if (jsonState) {
      const parsed = JSON.parse(jsonState);
      toggle = parsed.toggle;
    }

    // For side mode always open toggle when reloading
    if (mode === 'side') {
      toggle = 'opened';
    }

    return of(new LayoutDrawerStateUpdate({ mode, toggle }));
  });

  @Effect()
  drawerToggle$ = this.actions$.pipe(
    ofType(LAYOUT_DRAWER_TOGGLE),
    withLatestFrom(this.store.select('layout')),
    map(([, layout]) => {
      const toggle = (!layout || !layout.drawer || layout.drawer.toggle === 'closed') ? 'opened' : 'closed';
      return new LayoutDrawerStateUpdate({toggle});
    })
  );

  @Effect()
  onResize$ = fromEvent(this.window, 'resize').pipe(
    map(() => this.window.innerWidth > DRAWER_BREAKPOINT ? 'side' : 'over'),
    distinctUntilChanged(),
    simpleChange(),
    map((mode: SimpleChange) => {
      if (mode.currentValue === 'side' && mode.previousValue === 'over') {
        return new LayoutDrawerStateUpdate({ mode: 'side', toggle: 'opened' });
      } else {
        return new LayoutDrawerStateUpdate({ mode: mode.currentValue });
      }
    })
  );

  @Effect()
  drawerClose$ = merge(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), skip(1)),
    this.actions$.pipe(ofType(LAYOUT_DRAWER_CLOSE_IF_OVER))
  ).pipe(
    flatMap(() => this.store.select('layout').pipe(first())),
    map((layout: LayoutState) => {
      const toggle = (!layout || !layout.drawer || layout.drawer.mode === 'over') ? 'closed' : null;
      return new LayoutDrawerStateUpdate({toggle});
    }),
  );

  @Effect({ dispatch: false })
  saveState$ = this.store.select('layout', 'drawer').pipe(
    tap(drawerState => {
      this.storage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(drawerState));
    })
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly router: Router,
    @Inject('Window') private readonly window,
    storageProvider: StorageProviderService,
  ) {
    this.storage = storageProvider.getLocalStorage();
  }

}
