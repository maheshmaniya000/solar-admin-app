import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, debounceTime } from 'rxjs/operators';

import { Project, EnergySystemRef } from '@solargis/types/project';
import { PvConfigStatus } from '@solargis/types/pv-config';

import { ClearSystem } from 'ng-project/project-detail/actions/selected-system.actions';
import { selectSelectedEnergySystem, selectSelectedEnergySystemProject } from 'ng-project/project-detail/selectors';
import { State } from 'ng-project/project/reducers';
import { mapDefaultEnergySystem } from 'ng-project/project/utils/map-default-energy-system.operator';
import { mapPvConfigStatus } from 'ng-project/project/utils/map-pv-config-status.operator';
import { isFreetrialProject } from 'ng-project/project/utils/project-freetrial.utils';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { selectAlertsCount } from 'ng-shared/core/selectors/alerts.selector';
import { selectRouteDataFullscreen } from 'ng-shared/core/selectors/route-data.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectIsFreetrialActive, selectIsFreetrialToClaim } from 'ng-shared/user/selectors/company.selectors';
import { selectHasUserCompareAccess } from 'ng-shared/user/selectors/permissions.selectors';

import { routes, DetailRoute } from '../../detail.routes';
import { DetailRouteService } from '../../services/detail-route.service';


@Component({
  selector: 'sg-prospect-detail',
  templateUrl: './prospect-detail.component.html',
  styleUrls: ['./prospect-detail.component.scss']
})
export class ProspectDetailComponent extends SubscriptionAutoCloseComponent implements OnInit, OnDestroy {

  alertBarHeight$: Observable<number>;
  defaultTopPadding = 48;
  dynamicTopPadding = 30;

  project$: Observable<Project>;
  energySystemRef$: Observable<EnergySystemRef>;
  freetrialToClaim$: Observable<boolean>;
  freetrial$: Observable<boolean>;

  path$: Observable<string>;
  routes = routes.filter(r => !r.data.fullscreen);
  allowedPaths$: Observable<{[key: string]: boolean}>;
  pathsWithPermissions$: Observable<{[key: string]: boolean}>;

  hasCompareAccess$: Observable<boolean>;

  fullscreen$: Observable<boolean>;
  isReady$: Observable<boolean>; // ready for what?
  pvConfigStatus$: Observable<PvConfigStatus>;

  pvConfigWarning = true;

  currentRoute: DetailRoute;
  parentRoute: DetailRoute;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store<State>,
    private readonly detailService: DetailRouteService
  ) {
    super();
  }

  ngOnInit(): void {
    this.project$ = this.store.pipe(selectSelectedEnergySystemProject);

    this.pvConfigStatus$ = this.store.pipe(selectSelectedEnergySystem, mapPvConfigStatus());

    this.energySystemRef$ = this.store.pipe(
      selectSelectedEnergySystemProject,
      mapDefaultEnergySystem(),
    );

    this.freetrialToClaim$ = this.store.pipe(selectIsFreetrialToClaim);

    this.freetrial$ = combineLatest(this.project$, this.store.pipe(selectIsFreetrialActive)).pipe(
      map(([project, freetrialActive]) => freetrialActive && isFreetrialProject(project))
    );

    this.isReady$ = this.project$.pipe(
      map(p => !!p && p.status !== 'temporal')
    );

    this.hasCompareAccess$ = this.store.pipe(selectHasUserCompareAccess);
    this.fullscreen$ = this.store.pipe(selectRouteDataFullscreen);

    // path is used for right side navigation
    // FIXME this should be supported by Router with nested router outlets
    this.path$ = merge(
      this.route.url,
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)) // route changes on path
    ).pipe(
      map(() => {
        let path = this.route.firstChild.routeConfig.path;
        if (path.startsWith('*')) {path = 'overview';}
        return path;
      }),
      startWith('overview'),
      distinctUntilChanged(),
    );

    this.addSubscription(
      this.path$.subscribe(path => {
        this.currentRoute = this.routes.find(route => route.path === path);
        if (this.currentRoute && this.currentRoute.data) {
          this.parentRoute = this.routes.find(route => this.currentRoute.data.parent === route.path);
        }
      })
    );


    this.addSubscription(
      combineLatest([this.path$, this.project$]).pipe(
        filter(([, project]) => !!project && !!project._id),
          debounceTime(500),
        ).subscribe(
          ([page, project]) => this.store.dispatch(
            new AmplitudeTrackEvent('detail_page_open', { page, projectIds: [ project._id ] })
          )
        )
    );

    // decide, which detail routes are allowed
    this.allowedPaths$ = this.route.params.pipe(
      switchMap(() => this.detailService.filterAllowedRoutes(this.routes)),
      map((allowedRoutes: DetailRoute[]) => {
        const allowed = new Set(allowedRoutes.map(r => r.path));
        // map {path: true/false, ...}
        return this.routes.reduce((res, r) => {
          res[r.path] = allowed.has(r.path);
          return res;
        }, {}) as {[key: string]: boolean};
      })
    );

    this.pathsWithPermissions$ = this.route.params.pipe(
      switchMap(() => this.detailService.filterRoutesWithPermissions(this.routes)),
      map((allowedRoutes: DetailRoute[]) => {
        const allowed = new Set(allowedRoutes.map(r => r.path));
        return this.routes.reduce((res, r) => {
          res[r.path] = allowed.has(r.path);
          return res;
        }, {}) as {[key: string]: boolean};
      })
    );

    this.alertBarHeight$ = this.store.pipe(
      selectAlertsCount('prospect/detail'),
      map(count => count * this.dynamicTopPadding + this.defaultTopPadding)
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new ClearSystem());
  }

  onRouteNavigation(route: DetailRoute): void {
    this.router.navigate([route.path], { relativeTo: this.route });
  }
}
