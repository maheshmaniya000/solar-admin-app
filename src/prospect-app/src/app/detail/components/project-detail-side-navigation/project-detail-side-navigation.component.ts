import { Component, OnChanges, OnInit } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { selectSelectedEnergySystemProject } from 'ng-project/project-detail/selectors';
import { getEnergySystem } from 'ng-project/project/utils/map-default-energy-system.operator';
import { OpenContentLockedDialog } from 'ng-shared/core/actions/dialog.actions';
import { State } from 'ng-shared/core/reducers';
import { SideNavigationRoute } from 'ng-shared/shared/types';
import { SideNavigationComponent } from 'ng-shared/side-navigation/components/side-navigation/side-navigation.component';
import { selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';

@Component({
  selector: 'sg-project-detail-side-navigation',
  templateUrl: '../../../../../../ng-shared/src/lib/side-navigation/components/side-navigation/side-navigation.component.html',
  styleUrls: ['../../../../../../ng-shared/src/lib/side-navigation/components/side-navigation/side-navigation.component.scss']
})
export class ProjectDetailSideNavigationComponent extends SideNavigationComponent implements OnInit, OnChanges {
  lockerAction: Action | undefined;

  constructor(store: Store<State>) {
    super(store);
  }

  ngOnInit(): void {
    const energySystemRef$ = this.store.pipe(
      selectSelectedEnergySystemProject,
      map(project => getEnergySystem(project, 'prospect'))
    );
    this.subscriptions.push(
      energySystemRef$.subscribe(energySystemRef => {
        this.lockerAction = energySystemRef && !energySystemRef.systemId
          ? new OpenContentLockedDialog('pvConfig')
          : undefined;
      })
    );

    this.isOpened$ = combineLatest([
      this.store.pipe(selectIsUserLogged),
      this.store.select('layout', 'drawer')
    ]).pipe(
      map(([isLoggedIn, layoutDrawer]) => isLoggedIn && layoutDrawer.toggle === 'opened'),
      distinctUntilChanged()
    );
  }

  resolveLockerAction(route: SideNavigationRoute): Action | undefined {
    return super.resolveLockerAction(route) || this.lockerAction;
  }

}
