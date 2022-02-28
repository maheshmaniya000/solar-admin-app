import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';

import { CompareHighlight, CompareRemoveProject } from 'ng-project/project/actions/compare.actions';
import { AddToCompareDialogComponent } from 'ng-project/project/dialogs/add-to-compare-dialog/add-to-compare-dialog.component';
import { State } from 'ng-project/project/reducers';
import { selectCompareItemCount, selectCompareItems } from 'ng-project/project/selectors/compare.selectors';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { OpenUpdateProjectDataDialog } from 'ng-shared/core/actions/dialog.actions';
import { selectRouteData } from 'ng-shared/core/selectors/route-data.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectHasUserCompareAccess, selectUserPermissions } from 'ng-shared/user/selectors/permissions.selectors';
import { hasPermissionForRoute } from 'ng-shared/user/utils/route-permissions.utils';

import { CompareRoute, CompareRouteWarningsConfig, routes } from '../../compare.routes';

@Component({
  selector: 'sg-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent extends SubscriptionAutoCloseComponent implements OnInit {

  routes = routes;

  allowedPaths$: Observable<{[key: string]: boolean}>;

  hasPermission$: Observable<boolean>;

  path$: Observable<string>;
  compare$: Observable<CompareItem[]>;
  compareCount$: Observable<number>;
  warningsConfig$: Observable<CompareRouteWarningsConfig>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public store: Store<State>,
    private readonly dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.allowedPaths$ = this.store.pipe(
      selectUserPermissions,
      map(permissions =>
        routes
          .filter(route => hasPermissionForRoute(route, routes, permissions))
          .filter(route => !(route && route.data && route.data.disabled))
          .reduce((acc, route) => {
            acc[route.path] = !(route && route.data && route.data.disabled);
            return acc;
          }, {})
      )
    );

    this.hasPermission$ = this.store.pipe(selectHasUserCompareAccess);

    // path is used for right side navigation
    // FIXME this should be supported by Router with nested router outlets
    this.path$ = merge(
      this.route.url,
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)) // route changes on path
    ).pipe(
      map(() => {
        let path = this.route.firstChild.routeConfig.path;
        if (path.startsWith('*')) {path = routes[0].path;}
        return path;
      }),
      startWith(routes[0].path),
      distinctUntilChanged()
    );

    this.addSubscription(
      this.path$
        .pipe(debounceTime(100))
        .subscribe(page => this.store.dispatch(new AmplitudeTrackEvent('compare_open', { page })))
    );

    this.compare$ = this.store.pipe(selectCompareItems);
    this.compareCount$ = this.store.pipe(selectCompareItemCount);
    this.warningsConfig$ = this.store.pipe(
      selectRouteData,
      map(routerData => (routerData as CompareRoute['data'])?.warnings)
    );
  }

  removeItem(item: CompareItem): void {
    this.store.dispatch(new CompareRemoveProject(item.energySystemRef));
  }

  addToCompare(): void {
    this.dialog
      .open(AddToCompareDialogComponent, { data: { sortBy: 'isSelected', order: 'desc' }})
      .afterClosed()
      .subscribe();
  }

  highlightItem(item: CompareItem): void {
    this.store.dispatch(new CompareHighlight(item.energySystemRef));
  }

  openUpdateProjectDataDialog(item: CompareItem): void {
    this.store.dispatch(new OpenUpdateProjectDataDialog(item.energySystemRef));
  }

  onRouteNavigation(route: CompareRoute): void {
    this.router.navigate([route.path], { relativeTo: this.route });
  }
}
