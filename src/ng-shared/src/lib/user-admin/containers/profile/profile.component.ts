import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { AppDevice, Company, CompanyWithToken, User } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { ToggleDataUnitsDialogComponent } from 'ng-shared/shared/components/toggle-data-units-dialog/toggle-data-units-dialog.component';
import { AddCompanyDialogComponent } from 'ng-shared/user-shared/components/add-company-dialog/add-company-dialog.component';

import { AppDeviceStore } from '../../../app-device/app-device.store';
import { UpdateAppDeviceRequest } from '../../../app-device/update-app-device-request.model';
import { SettingsToggles } from '../../../core/actions/settings.actions';
import { SelectCompany, UnselectCompany } from '../../../user/actions/company.actions';
import { selectUserData } from '../../../user/selectors/auth.selectors';
import { selectActiveOrNoCompany, selectCompanyList, selectHasAppSubscription } from '../../../user/selectors/company.selectors';
import { AuthenticationService } from '../../../user/services/authentication.service';

@Component({
  selector: 'sg-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [AppDeviceStore]
})
export class ProfileComponent extends SubscriptionAutoCloseComponent implements OnInit {

  companyList$: Observable<CompanyWithToken[]>;
  selectedCompany$: Observable<Company>;
  user$: Observable<User>;
  sdatDeviceList$: Observable<AppDevice[]>;
  hasSDATSubscription$: Observable<boolean>;

  tabIndex$: Observable<number>;

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly appDeviceStore: AppDeviceStore
  ) { super(); }

  ngOnInit(): void {
    this.companyList$ = this.store.pipe(selectCompanyList);
    this.selectedCompany$ = this.store.pipe(selectActiveOrNoCompany);
    this.user$ = this.store.pipe(selectUserData);
    this.hasSDATSubscription$ = this.store.pipe(selectHasAppSubscription('sdat'));

    this.sdatDeviceList$ = this.appDeviceStore.devices$('sdat');
    this.tabIndex$ = this.route.queryParams.pipe(map(params => params?.tabId));

    this.addSubscription(
      this.tabIndex$.subscribe(index => {
        if (index) {this.appDeviceStore.loadUserAppDevices('sdat');}
      })
    );
  }

  selectedIndexChange(index: number): void {
    if (index === 2) {
      this.appDeviceStore.loadUserAppDevices('sdat');
    }
  }

  unselectCompany(): void {
    this.store.dispatch(new UnselectCompany());
  }

  selectCompany(company: CompanyWithToken): void {
    this.store.dispatch(new SelectCompany(company.company.sgCompanyId));
  }

  manageCompany(company: CompanyWithToken): void {
    this.store.dispatch(new SelectCompany(company.company.sgCompanyId));
    window.location.href = '/dashboard/company-admin/company-settings';
  }

  setPreviousUrl(): void {
    if (window.history.length > 2) {
      history.back();
    } else {
      this.router.navigate(['']);
    }
  }

  changePassword(): void {
    this.authenticationService.changePassword();
  }

  openUnitSettings(): void {
    this.dialog.open(ToggleDataUnitsDialogComponent, {}).afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result) {
          this.store.dispatch(new SettingsToggles(result));
        }
      });
  }

  addNewCompany(): void {
    this.dialog.open(AddCompanyDialogComponent);
  }

  updateAppDevice(update: UpdateAppDeviceRequest): void {
    this.appDeviceStore.updateDevice(update);
  }
}
