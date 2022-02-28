import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';

import { OpenContentLockedDialog } from '../../../core/actions/dialog.actions';
import { State } from '../../../core/reducers';
import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { SideNavigationRoute } from '../../../shared/types';

@Component({
  selector: 'sg-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss'],
})
export class SideNavigationComponent extends SubscriptionAutoCloseComponent implements OnInit, OnChanges {
  @Input() path: string;
  @Input() routes: SideNavigationRoute[];
  @Input() allowedPaths: { [key: string]: boolean };
  @Input() pathsWithPermissions: { [key: string]: boolean };

  @Output() onSelect = new EventEmitter();

  parents: SideNavigationRoute[];
  children: { [key: string]: SideNavigationRoute[] } = {};

  opened: { [key: string]: boolean } = {};

  isOpened$: Observable<boolean>;

  constructor(protected store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    this.isOpened$ = combineLatest([
      this.store.pipe(selectIsUserLogged),
      this.store.select('layout', 'drawer')
    ]).pipe(
      map(([isLoggedIn, layoutDrawer]) => isLoggedIn && layoutDrawer.toggle === 'opened'),
      distinctUntilChanged()
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // find activated routes
    if (changes.path) {
      const route = this.routes.find(r => r.path === this.path);

      if (route && route.data.parent) {
        this.setOpened(route.data.parent);
      }
      if (!route || !route.data.parent) {
        this.opened = {};
      }
    }
    // calculate children and parents
    if (changes.routes) {
      this.parents = this.routes.filter(r => !r.data.parent);

      this.routes.filter(r => !!r.data.parent).forEach(r => {
        const parent = r.data.parent;
        if (!this.children[parent]) {this.children[parent] = [];}
        this.children[parent].push(r);
      });
    }
  }

  click(e: any): void {
    this.onSelect.emit(e);
  }

  clickOnParent(e: SideNavigationRoute): void {
    this.click(e);
    this.setOpened(e.path, !this.opened[e.path]);
  }

  clickOnArrows(e: SideNavigationRoute): void {
    this.setOpenedArrow(e.path, !this.opened[e.path]);
  }

  setOpened(controlPageName: string, opened = true): void {
    this.opened = { [controlPageName]: opened };
  }

  setOpenedArrow(controlPageName: string, opened = true): void {
    this.opened[controlPageName] = opened;
  }

  openLockerModal(route: SideNavigationRoute): void {
    const lockerAction = this.resolveLockerAction(route);
    if (lockerAction) {this.store.dispatch(lockerAction);}
  }

  resolveLockerAction(route: SideNavigationRoute): Action | undefined {
    const { path } = route;
    if (!this.pathsWithPermissions[path]) {
      return new OpenContentLockedDialog(path);
    }
  }

  isOpened(isSidenavOpened): void {
    this.isOpened$ = isSidenavOpened;
  }
}
