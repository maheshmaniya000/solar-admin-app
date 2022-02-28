import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { AppDevice, SDATSubscription, User, UserCompany } from '@solargis/types/user-company';

import { AppDeviceStore } from 'ng-shared/app-device/app-device.store';
import { UpdateAppDeviceRequest } from 'ng-shared/app-device/update-app-device-request.model';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { getAppSubscription } from 'ng-shared/user/utils/company.utils';

import { UpdateCompanyApp } from '../../actions/company-app.actions';

@Component({
  selector: 'sg-sdat-subscription',
  templateUrl: './sdat-subscription.component.html',
  styleUrls: ['./sdat-subscription.component.scss'],
  providers: [AppDeviceStore]
})
export class SDATSubscriptionComponent extends SubscriptionAutoCloseComponent implements OnInit  {

  subscription$: Observable<SDATSubscription>;
  companyUsers$: Observable<(UserCompany & User)[]>;
  companyDevices$: Observable<AppDevice[]>;

  selectedUsers: {[key: string]: boolean};
  filterUser: User;
  userCount = 0;

  changed = false;
  loading = true;

  @ViewChild(MatTabGroup, { static: false }) matTabGroup: MatTabGroup;

  constructor(
    private readonly store: Store,
    private readonly companyService: CompanyService,
    private readonly appDevicesStore: AppDeviceStore
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscription$ = this.store.pipe(
      selectActiveOrNoCompany,
      tap(() => this.loading = false),
      filter(x => !!x),
      map(c => getAppSubscription(c, 'sdat'))
    );

    this.companyUsers$ = this.store.pipe(
      selectActiveOrNoCompany,
      distinctUntilChanged(),
      filter(c => !!c),
      switchMap(company => this.companyService.listUsersForCompanyByStatus(company.sgCompanyId, 'ACTIVE')),
      shareReplay()
    );

    this.companyDevices$ = this.appDevicesStore.devices$('sdat');

    this.addSubscription(
      combineLatest([this.subscription$, this.companyUsers$])
        .subscribe(([subscription, users]) => this.setSubscription(subscription, users))
    );
  }

  setSubscription(subscription: SDATSubscription, users: (UserCompany & User)[]): void {
    this.selectedUsers = {};
    this.userCount = 0;

    if (subscription && subscription.assignedUsers) {

      users.forEach(u => (this.selectedUsers[u.sgAccountId] = false));
      subscription?.assignedUsers?.forEach(
        u => {this.selectedUsers[u] = true; this.userCount++; }
      );
    }
  }

  selectedIndexChange(index: number): void {
    if (index >= 1) {
      this.appDevicesStore.loadActiveCompanyAppDevices('sdat');
    }
  }

  selectUser(sgAccountId: string, checked: boolean): void {
    this.selectedUsers[sgAccountId] = checked;
    this.userCount = Object.keys(this.selectedUsers).filter(u => this.selectedUsers[u]).length;
    this.changed = true;
  }

  selectAllUsers(selected: boolean): void {
    Object.keys(this.selectedUsers).forEach(sgAccountId => this.selectedUsers[sgAccountId] = selected);
    this.userCount = Object.keys(this.selectedUsers).filter(u => this.selectedUsers[u]).length;
    this.changed = true;
  }

  save(users: (UserCompany & User)[]): void {
    const assignedUsers = users.map(u => u.sgAccountId).filter(u => this.selectedUsers[u]);

    this.store.dispatch(new UpdateCompanyApp('sdat', { assignedUsers }));
    this.changed = false;
  }

  filterDevicesByUser(user: User): void {
    this.filterUser = user;
    this.matTabGroup.selectedIndex = 2;
  }

  updateDevice(update: UpdateAppDeviceRequest): void {
    this.appDevicesStore.updateDevice(update);
  }
}
