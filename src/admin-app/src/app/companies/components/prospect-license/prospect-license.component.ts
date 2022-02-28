import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap, tap } from 'rxjs/operators';

import {
  Company,
  mapProspectLicenseType,
  ProspectLicense,
  ProspectLicenseType,
  ProspectSubscription,
  SDATSubscription,
  User,
  UserCompanyDetails
} from '@solargis/types/user-company';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { getAppSubscription } from 'ng-shared/user/utils/company.utils';

import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../../store';
import { CompaniesActions, CompaniesSelectors } from '../../store';

const licenseTypes: ProspectLicenseType[] = [
  ProspectLicenseType.Basic,
  ProspectLicenseType.Pro,
  ProspectLicenseType.FreeTrial
];

type ProspectLicenseForm = Omit<ProspectLicense, 'from' | 'to'> & {
  from: Date; // Datepicker requires Date object
  to: Date;
};

@Component({
  selector: 'sg-admin-prospect-license',
  templateUrl: './prospect-license.component.html',
  styleUrls: ['./prospect-license.component.scss']
})
export class ProspectLicenseComponent
  extends SubscriptionAutoCloseComponent
  implements OnInit {
  company: Company;
  hasProspectLicense$ = new BehaviorSubject<boolean>(false);
  subscription$: Observable<ProspectSubscription>;

  companyUsers: User[];
  selectedUsers: { [key: string]: boolean };
  tooManyUsers$ = new BehaviorSubject<boolean>(false);

  licenseTypes = licenseTypes;
  mapProspectLicenseType = mapProspectLicenseType;

  get licenseType(): AbstractControl | null {
    return this.form && this.form.get('licenseType');
  }

  FREE_TRIAL = ProspectLicenseType.FreeTrial;

  form: FormGroup;

  savingOrDeleting = false;

  emptyLicense: ProspectLicenseForm = {
    from: new Date(),
    to: new Date(new Date().getFullYear(), 11, 31),
    licenseType: licenseTypes[0],
    usersLimit: 5,
    remainingFreeTrialProjects: null
  };

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly companyService: CompanyService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    const company$ = this.store.select(CompaniesSelectors.selectSelected).pipe(
      tap(company => {
        if (isNil(company)) {
          this.router.navigateByUrl('/list/companies');
        }
      }),
      filter(company => !isNil(company))
    );

    this.subscription$ = company$.pipe(
      filter(x => !!x),
      map(c => getAppSubscription<SDATSubscription>(c, 'prospect'))
    );

    company$
      .pipe(
        switchMap(company =>
          this.companyService
            .listUsersForCompanyByStatus(company.sgCompanyId, 'ACTIVE', 'SUSPENDED')
            .pipe(map(users => [company, users]))
        ),
        first()
      )
      .subscribe(([company, users]: [Company, UserCompanyDetails[]]) => {
        this.companyUsers = users as User[];
        this.selectedUsers = {};

        users.forEach(u => (this.selectedUsers[u.sgAccountId] = false));
        if (!!company.prospectLicense && !!company.prospectLicense.assignedUsers) {
          company.prospectLicense.assignedUsers.forEach(u => (this.selectedUsers[u] = true));
        }
      });

    this.form = this.fb.group({
      from: [undefined, [Validators.required]],
      to: [undefined, [Validators.required]],
      licenseType: [undefined, []],
      usersLimit: [undefined, [Validators.required, Validators.min(1)]],
      remainingFreeTrialProjects: [undefined, []]
    });

    company$.pipe(first()).subscribe(company => {
      this.company = company;

      let license: ProspectLicenseForm;
      if (company.prospectLicense) {
        license = {
          ...company.prospectLicense,
          from: new Date(company.prospectLicense.from),
          to: new Date(company.prospectLicense.to)
        };
      }
      this.hasProspectLicense$.next(!!license);
      this.form.patchValue(license || this.emptyLicense);
    });

    this.addSubscription(
      this.form.valueChanges
        .pipe(
          map(change => change.usersLimit),
          distinctUntilChanged()
        )
        .subscribe(usersLimit => {
          this.tooManyUsers$.next(this.getAssignedUsers().length > usersLimit);
        })
    );

    this.addSubscription(
      this.form.valueChanges
        .pipe(
          map(change => change.licenseType && change.licenseType === this.FREE_TRIAL),
          distinctUntilChanged()
        )
        .subscribe(freeTrialType => {
          if (freeTrialType) {
            this.form.patchValue({ remainingFreeTrialProjects: 1 });
          } else {
            this.form.patchValue({ remainingFreeTrialProjects: null });
          }
        })
    );
  }

  createLicense(): void {
    this.form.setValue(this.emptyLicense);
    this.hasProspectLicense$.next(true);
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
    const values = this.form.value as ProspectLicenseForm;

    const license: ProspectLicense = {
      ...values,
      from: new Date(values.from).getTime(),
      to: new Date(values.to).getTime(),
      assignedUsers: this.getAssignedUsers(),
      usersLimit: parseInt((values.usersLimit || '0') as string, 10)
    };
    if (license.licenseType !== this.FREE_TRIAL) {
      delete license.remainingFreeTrialProjects;
    }

    this.savingOrDeleting = true;
    this.adminUsersCompaniesService.saveAppSubscription(this.company, 'prospect', license).subscribe(
      company => {
        this.savingOrDeleting = false;
        this.snackBar.open('Prospect subscription has been saved', null, {
          duration: 3000,
          panelClass: ['snackbarPass', 'snackbarTextCenter']
        });

        // update company in store (so when user hit BACK and open again edit of prospect -> it will be updated)
        this.store.dispatch(CompaniesActions.companyUpdated({ company }));
        this.onCloseClick();
      },
      err => {
        console.error(err);
        this.savingOrDeleting = false;
        this.snackBar.open('Prospect subscription could not be saved', null, {
          duration: 3000,
          panelClass: ['snackbarError', 'snackbarTextCenter']
        });
      }
    );
  }

  delete(): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: { text: 'Remove prospect subscription?' },
        minWidth: '300px',
        maxWidth: '600px',
        minHeight: '200px'
      })
      .afterClosed()
      .pipe(
        filter(x => !!x),
        switchMap(() => {
          this.savingOrDeleting = true;
          return this.company.prospectLicense
            ? this.adminUsersCompaniesService.deleteAppSubscription(this.company, 'prospect')
            : of(null);
        })
      )
      .subscribe(
        () => {
          this.selectedUsers = {};
          this.savingOrDeleting = false;
          this.hasProspectLicense$.next(false);
          this.snackBar.open('Prospect subscription has been deleted', null, {
            duration: 3000,
            panelClass: ['snackbarPass', 'snackbarTextCenter']
          });

          // update company in store (so when user hit BACK and open again edit of prospect -> it will be deleted)
          const company: Company = { ...this.company, prospectLicense: undefined };
          this.store.dispatch(CompaniesActions.companyUpdated({ company }));
        },
        err => {
          console.error(err);
          this.savingOrDeleting = false;
          this.snackBar.open(
            'Prospect subscription could not be deleted',
            null,
            {
              duration: 3000,
              panelClass: ['snackbarError', 'snackbarTextCenter']
            }
          );
        }
      );
  }

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.route});
  }

  private getAssignedUsers(): string[] {
    return this.companyUsers.map(u => u.sgAccountId).filter(u => this.selectedUsers[u]) || [];
  }
}
