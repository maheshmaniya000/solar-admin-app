import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { mapProspectLicenseType, ProspectLicense, User, UserCompany } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { State } from 'ng-shared/user/reducers';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { CompanyService } from 'ng-shared/user/services/company.service';

import { UpdateCompanyApp } from '../../actions/company-app.actions';

@Component({
  selector: 'sg-prospect-subscription',
  templateUrl: './prospect-subscription.component.html',
  styleUrls: ['./prospect-subscription.component.scss']
})
export class ProspectSubscriptionComponent extends SubscriptionAutoCloseComponent implements OnInit  {

  license$: Observable<ProspectLicense>;
  companyUsers$: Observable<(UserCompany & User)[]>;

  selectedUsers = {};
  userCount = 0;

  changed = false;
  loading = true;

  mapProspectLicenseType = mapProspectLicenseType;

  constructor(private readonly store: Store<State>, private readonly companyService: CompanyService) {
    super();
  }

  ngOnInit(): void {
    this.license$ = this.store.pipe(
      selectActiveOrNoCompany,
      tap(() => this.loading = false),
      filter(x => !!x),
      map(c => c.prospectLicense)
    );

    this.companyUsers$ = this.store.pipe(
      selectActiveOrNoCompany,
      distinctUntilChanged(),
      filter(c => !!c),
      switchMap(company => this.companyService.listUsersForCompanyByStatus(company.sgCompanyId, 'ACTIVE')),
      shareReplay()
    );

    this.addSubscription(
      combineLatest([this.license$, this.companyUsers$]).subscribe(([license, users]) => this.setLicense(license, users))
    );
  }

  setLicense(prospectLicense: ProspectLicense, users: (UserCompany & User)[]): void {
    this.selectedUsers = {};
    if (prospectLicense && prospectLicense.assignedUsers) {
      this.userCount = prospectLicense.assignedUsers.length;

      users.forEach(u => this.selectedUsers[u.sgAccountId] = false);
      prospectLicense.assignedUsers?.forEach(u => this.selectedUsers[u] = true);
    }
  }

  selectUser(sgAccountId: string, checked: boolean): void {
    this.selectedUsers[sgAccountId] = checked;
    this.userCount = Object.keys(this.selectedUsers).filter(u => this.selectedUsers[u]).length;
    this.changed = true;
  }

  selectAllUsers(selected: boolean): void {
    Object.keys(this.selectedUsers).forEach(sgAccountId => (this.selectedUsers[sgAccountId] = selected));
    this.userCount = Object.keys(this.selectedUsers).filter(u => this.selectedUsers[u]).length;
    this.changed = true;
  }

  save(users: (UserCompany & User)[]): void {
    const assignedUsers = users.map(u => u.sgAccountId).filter(u => this.selectedUsers[u]);

    this.store.dispatch(new UpdateCompanyApp('prospect', { assignedUsers }));
    this.changed = false;
  }
}
