import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, first, filter } from 'rxjs/operators';

import { selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';

import { LayoutDrawerStateUpdate } from '../../../core/actions/layout.actions';
import { State } from '../../../core/reducers';
import { DrawerModeState, OpenedClosedState } from '../../../core/reducers/layout.reducer';
import { SubscriptionAutoCloseComponent } from '../subscription-auto-close.component';


@Component({
  selector: 'sg-drawer-layout',
  templateUrl: './drawer-layout.component.html',
  styleUrls: ['./drawer-layout.component.scss']
})
export class DrawerLayoutComponent extends SubscriptionAutoCloseComponent implements OnInit {
  opened$: Observable<boolean>;
  mode$: Observable<DrawerModeState>;

  @ViewChild('content', { static: true }) content: ElementRef;

  constructor(
    private readonly store: Store<State>,
    private readonly router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.mode$ = this.store.select('layout').pipe(
      map(layout => layout.drawer.mode),
      distinctUntilChanged()
    );

    this.opened$ = combineLatest(
      this.store.pipe(selectIsUserLogged),
      this.store.select('layout', 'drawer')
    ).pipe(
    map(([isLoggedIn, layoutDrawer]) => isLoggedIn && layoutDrawer.toggle === 'opened'),
    distinctUntilChanged(),
  );

    // reset scroll position on route change
    this.addSubscription(
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        filter(() => !!this.content && !!this.content.nativeElement)
      ).subscribe(
        () => {
          const nativeElement = this.content.nativeElement;
          // Microsoft Edge does not know scrollTop
          if (nativeElement && nativeElement.scrollTop) {nativeElement.scrollTop = 0;}
          else if (nativeElement && nativeElement.scrollTo) {nativeElement.scrollTo(0, 0);}
        }
      )
    );
  }

  /**
   * Push state to store if its out of sync.
   * For example if the mode === 'over' if user click outside of nav, it is closed.
   * We need to push this info to store
   */
  pushState(state: OpenedClosedState): void {
    this.opened$.pipe(
      first()
    ).subscribe(
      storeState => {
        if (storeState !== (state === 'opened')) {this.store.dispatch(new LayoutDrawerStateUpdate({ toggle: state}));}
      }
    );
  }

}
