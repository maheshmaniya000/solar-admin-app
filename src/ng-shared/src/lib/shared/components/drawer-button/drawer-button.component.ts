import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { User } from '@solargis/types/user-company';

import { selectIsUserLogged, selectUser } from 'ng-shared/user/selectors/auth.selectors';

import { LayoutDrawerToggle } from '../../../core/actions/layout.actions';
import { State } from '../../../core/reducers';

type ButtonStyle = 'arrowButton' | 'menuButton';

@Component({
  selector: 'sg-drawer-button',
  templateUrl: './drawer-button.component.html',
  styleUrls: ['./drawer-button.component.scss']
})
export class DrawerButtonComponent {
  @Input() buttonStyle: ButtonStyle = 'menuButton';
  user$: Observable<User>;
  opened$: Observable<boolean>;

  constructor(private readonly store: Store<State>) {
    this.user$ = this.store.pipe(selectUser);

    this.opened$ = combineLatest([
      this.store.pipe(selectIsUserLogged),
      this.store.select('layout', 'drawer')
    ]).pipe(
      map(([isLoggedIn, layoutDrawer]) => isLoggedIn && layoutDrawer.toggle === 'opened'),
      distinctUntilChanged()
    );
  }

  drawerClick(): void {
    this.store.dispatch(new LayoutDrawerToggle());
  }
}
