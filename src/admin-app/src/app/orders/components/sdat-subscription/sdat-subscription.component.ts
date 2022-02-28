import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { cloneDeep, isNil } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { AppDevice, AppSubscriptionType, Company, SDATSubscription, User, UserCompany } from '@solargis/types/user-company';

import { AppDeviceStore } from 'ng-shared/app-device/app-device.store';
import { UpdateAppDeviceRequest } from 'ng-shared/app-device/update-app-device-request.model';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { getAppSubscription } from 'ng-shared/user/utils/company.utils';

import { CompaniesActions, CompaniesSelectors } from '../../../companies/store';
import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../../store';

const subscriptionTypes: AppSubscriptionType[] = [
  AppSubscriptionType.SDATBasic,
  AppSubscriptionType.SDATPro,
  AppSubscriptionType.SDATFreeTrial
];

type SDATSubscriptionForm = Omit<SDATSubscription, 'from' | 'to'> & {
  from: Date; // Datepicker requires Date object
  to: Date;
};

@Component({
  selector: 'sg-admin-sdat-subscription',
  templateUrl: './sdat-subscription.component.html',
  styleUrls: ['./sdat-subscription.component.scss'],
  providers: [AppDeviceStore]
})
export class SDATSubscriptionComponent extends SubscriptionAutoCloseComponent implements OnInit {
  hasSDATSubscription$ = new BehaviorSubject<boolean>(false);
  subscription$: Observable<SDATSubscription>;

  companyUsers: User[];
  companyUsers$: Observable<(UserCompany & User)[]>;
  selectedUsers: { [key: string]: boolean };
  tooManyUsers$ = new BehaviorSubject<boolean>(false);
  filterUser: User;

  company: Company;
  company$: Observable<Company>;
  companyDevices$: Observable<AppDevice[]>;

  form: FormGroup;
  savingOrDeleting = false;
  loading = true;

  subscriptionTypes = subscriptionTypes;

  emptySubscription: SDATSubscriptionForm = {
    from: new Date(),
    to: new Date(new Date().getFullYear(), 11, 31),
    type: subscriptionTypes[0],
    usersLimit: 5,
    devicesPerUser: 3,
    offlineDuration: 168
  };

  get type(): AbstractControl | null {
    return this.form && this.form.get('type');
  }
  get devicesPerUser(): AbstractControl | null {
    return this.form && this.form.get('devicesPerUser');
  }

  @ViewChild(MatTabGroup, { static: false }) matTabGroup: MatTabGroup;

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly router: Router,
    private readonly appDevicesStore: AppDeviceStore,
    private readonly route: ActivatedRoute,
    private readonly companyService: CompanyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      from: [undefined, [Validators.required]],
      to: [undefined, [Validators.required]],
      type: [undefined, [Validators.required]],
      usersLimit: [undefined, [Validators.required, Validators.min(1)]],
      devicesPerUser: [undefined, [Validators.required, Validators.min(1)]],
      offlineDuration: [undefined, [Validators.required, Validators.min(1)]]
    });

    this.company$ = this.store.select(CompaniesSelectors.selectSelected).pipe(
      tap(company => {
        if (isNil(company)) {
          this.router.navigateByUrl('/list/companies');
        }
      }),
      filter(company => !isNil(company))
    );

    this.subscription$ = this.company$.pipe(
      filter(x => !!x),
      map(c => getAppSubscription<SDATSubscription>(c, 'sdat'))
    );

    this.companyUsers$ = this.company$.pipe(
      distinctUntilChanged(),
      filter(c => !!c),
      switchMap(company =>
        this.companyService.listUsersForCompany(company.sgCompanyId)
      ),
      shareReplay()
    );

    this.addSubscription(
      this.form.valueChanges
        .pipe(map(change => change.usersLimit), distinctUntilChanged())
        .subscribe(usersLimit => {
          this.tooManyUsers$.next(this.getAssignedUsers().length > usersLimit);
        })
    );

    this.addSubscription(
      combineLatest([this.subscription$,this.companyUsers$])
        .subscribe(([subscription, users]) => this.setSubscription(subscription, users))
    );

    this.companyDevices$ = this.appDevicesStore.devices$('sdat');
  }

  createSDATSubscription(): void {
    this.form.setValue(this.emptySubscription);
    this.hasSDATSubscription$.next(true);
  }

  selectedIndexChange(index: number): void {
    if (index >= 1) {
      this.company$.pipe(first()).subscribe(company => this.appDevicesStore.loadCompanyAppDevices({ app: 'sdat', company }));
    }
  }

  selectUser(sgAccountId: string, selected: boolean): void {
    this.selectedUsers[sgAccountId] = selected;
    this.tooManyUsers$.next(this.form.value.usersLimit < this.getAssignedUsers().length);
  }

  selectAllUsers(selected: boolean): void {
    Object.keys(this.selectedUsers).forEach(sgAccountId => this.selectedUsers[sgAccountId] = selected);
    this.tooManyUsers$.next(this.form.value.usersLimit < this.getAssignedUsers().length);
  }

  save(): void {
    const values = this.form.value as SDATSubscriptionForm;

    const subscription: SDATSubscription = {
      ...values,
      from: new Date(values.from).getTime(),
      to: new Date(values.to).getTime(),
      assignedUsers: this.getAssignedUsers(),
      usersLimit: parseInt((values.usersLimit || '0') as string, 10)
    };

    this.savingOrDeleting = true;
    this.company$.pipe(first()).subscribe(company =>
      this.adminUsersCompaniesService
        .saveAppSubscription(company, 'sdat', subscription)
        .subscribe(
          companyValue => {
            this.savingOrDeleting = false;
            this.snackBar.open('SDAT subscription has been saved', null, {
              duration: 3000,
              panelClass: ['snackbarPass', 'snackbarTextCenter']
            });

            // update company in store (so when user hit BACK and open again edit of prospect -> it will be updated)
            this.store.dispatch(CompaniesActions.companyUpdated({ company: companyValue }));
            this.onCloseClick();
          },
          err => {
            console.error(err);
            this.savingOrDeleting = false;
            this.snackBar.open('SDAT subscription could not be saved', null, {
              duration: 3000,
              panelClass: ['snackbarError', 'snackbarTextCenter']
            });
          }
        )
    );
  }

  delete(): void {
    this.company$.pipe(first()).subscribe(company =>
      this.dialog
        .open(ConfirmationDialogComponent, {
          data: {
            text: 'Remove SDAT subscription?'
          },
          minWidth: '300px',
          maxWidth: '600px',
          minHeight: '200px'
        })
        .afterClosed()
        .pipe(
          filter(x => !!x),
          switchMap(() => {
            this.savingOrDeleting = true;
            return getAppSubscription(company, 'sdat')
              ? this.adminUsersCompaniesService.deleteAppSubscription(company, 'sdat')
              : of(null);
          })
        )
        .subscribe(
          () => {
            this.selectedUsers = {};
            this.savingOrDeleting = false;
            this.hasSDATSubscription$.next(false);
            this.snackBar.open('SDAT subscription has been deleted', null, {
              duration: 3000,
              panelClass: ['snackbarPass', 'snackbarTextCenter']
            });

            // update company in store (so when user hit BACK and open again edit of prospect -> it will be deleted)
            const cloneCompany = cloneDeep(company);
            cloneCompany.app.sdat = undefined;
            this.store.dispatch(CompaniesActions.companyUpdated({ company: cloneCompany }));
          },
          err => {
            console.error(err);
            this.savingOrDeleting = false;
            this.snackBar.open('SDAT subscription could not be deleted', null, {
              duration: 3000,
              panelClass: ['snackbarError', 'snackbarTextCenter']
            });
          }
        )
    );
  }

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.route});
  }

  filterDevicesByUser(user: User): void {
    this.filterUser = user;
    this.matTabGroup.selectedIndex = 2;
  }

  updateAppDevice(update: UpdateAppDeviceRequest): void {
    this.appDevicesStore.updateDevice(update);
  }

  private getAssignedUsers(): string[] {
    return this.companyUsers?.map(u => u.sgAccountId).filter(u => this.selectedUsers[u]) || [];
  }

  private setSubscription(subscription: SDATSubscription, users: (UserCompany & User)[]): void {
    this.loading = false;
    this.selectedUsers = {};
    this.companyUsers = users as User[];
    let sdatSubscription: SDATSubscriptionForm;

    if (subscription && subscription.assignedUsers) {
      sdatSubscription = {
        ...subscription,
        from: new Date(subscription.from),
        to: new Date(subscription.to)
      };

      users.forEach(u => this.selectedUsers[u.sgAccountId] = false);
      subscription.assignedUsers?.forEach(u => this.selectedUsers[u] = true);

      this.hasSDATSubscription$.next(true);
      this.form.patchValue(sdatSubscription || this.emptySubscription);
    }
  }
}
