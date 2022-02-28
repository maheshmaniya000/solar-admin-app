import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Company, isProspectSubscriptionExpired, mapProspectLicenseType, User } from '@solargis/types/user-company';

import { State } from 'ng-shared/core/reducers';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectUserData } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany, selectHasAppSubscription } from 'ng-shared/user/selectors/company.selectors';
import { selectIsUserAdmin } from 'ng-shared/user/selectors/permissions.selectors';
import { isCompanyAdmin } from 'ng-shared/user/utils/company.utils';

import { selectAllRecentProjectsDashboardItem } from '../../selector/recent-projects.selectors';

@Component({
  selector: 'sg-recent-projects',
  templateUrl: './recent-projects.component.html',
  styleUrls: ['./recent-projects.component.scss']
})
export class RecentProjectsComponent extends SubscriptionAutoCloseComponent implements OnInit {
  user$: Observable<User>;
  company$: Observable<Company>;

  hasSDATSubscription$: Observable<boolean>;
  isSolargisAdmin$: Observable<boolean>;
  isCompanyAdmin$: Observable<boolean>;
  isProspectSubscriptionExpired = isProspectSubscriptionExpired;

  numberOfRecentProjects$: Observable<number>;
  showRecentProjectsTableView: boolean = true;

  userLicense$: Observable<string>;

  constructor(private readonly store: Store<State>) { super(); }

  ngOnInit(): void {
    this.user$ = this.store.pipe(selectUserData);
    this.company$ = this.store.pipe(selectActiveOrNoCompany);

    this.userLicense$ = combineLatest([this.company$, this.user$]).pipe(
      filter(([company, user]) => !!company?.prospectLicense?.licenseType && company?.prospectLicense?.assignedUsers
        .some(sgAccountId => sgAccountId === user.sgAccountId)),
      map(([company]) => mapProspectLicenseType(company.prospectLicense.licenseType))
    );

    this.hasSDATSubscription$ = this.store.pipe(selectHasAppSubscription('sdat'));
    this.isSolargisAdmin$ = this.store.pipe(selectIsUserAdmin);

    this.numberOfRecentProjects$ = this.store.pipe(
      selectAllRecentProjectsDashboardItem,
      map(projects => projects.length)
    );

    this.isCompanyAdmin$ = combineLatest(this.company$, this.user$).pipe(
      map(([company, user]) => isCompanyAdmin(company, user))
    );
  }

  toggleRecentProjectView(): void {
    this.showRecentProjectsTableView = !this.showRecentProjectsTableView;
  }
}
