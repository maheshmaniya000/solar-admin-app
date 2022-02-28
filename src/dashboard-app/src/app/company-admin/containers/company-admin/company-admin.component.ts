import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';

import { State } from 'ng-shared/core/reducers';
import { selectRouteDataFullscreen } from 'ng-shared/core/selectors/route-data.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { SideNavigationRoute } from 'ng-shared/shared/types';
import { selectUser } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { isCompanyAdmin } from 'ng-shared/user/utils/company.utils';

import { routes } from '../../company-admin.routes';

@Component({
  selector: 'sg-company-admin',
  templateUrl: './company-admin.component.html',
  styleUrls: ['./company-admin.component.scss']
})
export class CompanyAdminComponent extends SubscriptionAutoCloseComponent implements OnInit {

  fullscreen$: Observable<boolean>;

  route$: Observable<SideNavigationRoute>;
  path$: Observable<string>;
  routes = routes;

  constructor(
    private readonly store: Store<State>,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.fullscreen$ = this.store.pipe(selectRouteDataFullscreen);

    this.route$ = merge(
      this.route.url,
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)) // route changes on path
    ).pipe(
      map(() => this.route && this.route.firstChild && this.route.firstChild.routeConfig),
      map(route => !route || route.path.startsWith('*') ? routes[0] : route),
      startWith(routes[0]),
      distinctUntilChanged()
    );

    this.path$ = this.route$.pipe(
      map(route => route.path),
    );

    // If user changes company and is not company admin, kick him out of admin
    this.addSubscription(
      combineLatest([
        this.store.pipe(selectActiveOrNoCompany),
        this.store.pipe(selectUser)
      ]).subscribe(([company, user]) => {
        if (!company || !isCompanyAdmin(company, user)) {this.router.navigateByUrl('/');}
      })
    );
  }

  onRouteSelect(route: SideNavigationRoute): void {
    this.router.navigate([route.path], { relativeTo: this.route.parent });
  }

}
