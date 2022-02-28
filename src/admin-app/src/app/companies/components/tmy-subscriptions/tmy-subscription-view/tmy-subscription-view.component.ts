import { Component, OnInit  } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ComponentMode } from 'src/admin-app/src/app/shared/models/component-mode.enum';
import { AdminUsersCompaniesService } from 'src/admin-app/src/app/shared/services/admin-users-companies.service';

import { Company, User, UserCompanyDetails } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { CompanyService } from 'ng-shared/user/services/company.service';

import { fromAdmin } from '../../../../store';
import { CompaniesSelectors } from '../../../store';


const tmysubscriptionTypes  = [
  'TMY BASIC',
  'TMY PRO'
];

const tmystatusTypes = [
  'Active',
  'Inactive'
];


@Component({
  selector: 'sg-tmy-subscription-view',
  templateUrl: './tmy-subscription-view.component.html',
  styleUrls: ['./tmy-subscription-view.component.scss'],
})
export class TmySubscriptionViewComponent extends SubscriptionAutoCloseComponent implements OnInit {
  readonly componentMode = ComponentMode;
  mode: ComponentMode;
  headerLabel: Record<ComponentMode, string> = {
    [ComponentMode.add]: 'Add Subscription',
    [ComponentMode.view]: 'View Subscription',
    [ComponentMode.edit]: 'Edit Subscription'
  };

  form: FormGroup;
  tmysubscriptionTypes = tmysubscriptionTypes;
  tmystatusTypes = tmystatusTypes;
  companyUsers: User[];
  company: Company;
  selectedUsers: { [key: string]: boolean };
  savingOrDeleting = false;

  data = [];
  tokenDataShow = false;
  tokenData = [];
  displayname: any;

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly snackBar: MatSnackBar,
    private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data.mode;
    this.createForm();

    if (this.mode !== ComponentMode.add) {
      this.adminUsersCompaniesService.getTMYSubscription().subscribe(data => {
        this.data = data;
        this.form.patchValue(
          {
            tmysubType : this.data[0].subscriptionType,
            subId : data[0].id,
            from : data[0].startDate,
            to : data[0].expiryDate,
            tmystatusType : data[0].status,
            originalCalls : data[0].calls,
            remainingCalls : data[0].remainingCalls,
          },
        );
      });
    }


    const company$ = this.store.select(CompaniesSelectors.selectSelected).pipe(
      tap(company => {
        if (isNil(company)) {
          this.router.navigateByUrl('/list/companies');
        }
      }),
      filter(company => !isNil(company))
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
      // this.companyUsers.forEach(item=> {
      //   item.tokenGenerationDate = '28-01-2021';
      // });
      this.selectedUsers = {};

      users.forEach(u => (this.selectedUsers[u.sgAccountId] = false));
      if (!!company.prospectLicense && !!company.prospectLicense.assignedUsers) {
        company.prospectLicense.assignedUsers.forEach(u => (this.selectedUsers[u] = true));
      }
    });

    company$.pipe(first()).subscribe(company => {
      this.company = company;

      // let license: ProspectLicenseForm;
      // if (company.prospectLicense) {
      //   license = {
      //     ...company.prospectLicense,
      //     from: new Date(company.prospectLicense.from),
      //     to: new Date(company.prospectLicense.to)
      //   };
      // }
      // this.hasProspectLicense$.next(!!license);
      // this.form.patchValue(license || this.emptyLicense);
    });

  }

  get tmysubType(): AbstractControl | null {
    return this.form && this.form.get('tmysubType');
  }
  createForm(): void {
    this.form = this.fb.group({
      from: [new Date(), [Validators.required]],
      to: [new Date(new Date().setDate(new Date().getDate() + 1)), [Validators.required]],
      tmysubType: ['TMY BASIC', []],
      tmystatusType: [undefined, []],
      originalCalls: [undefined, [Validators.required, Validators.min(1)]],
      remainingCalls: [{ value: undefined, disabled: true }, [Validators.required, Validators.min(1)]],
      subId: [{ value: undefined, disabled: true }, [Validators.required]],
      usersLimit: [30, [Validators.required, Validators.min(1)]],
      consumption: [false, []],
    });
  }

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.route});
  }
  selectAllUsers(selected: boolean): void {
    Object.keys(this.selectedUsers).forEach(sgAccountId => this.selectedUsers[sgAccountId] = selected);
    // this.tooManyUsers$.next(this.form.value.usersLimit < this.getAssignedUsers().length);
  }

  selectUser(sgAccountId: string, selected: boolean): void {
    this.selectedUsers[sgAccountId] = selected;
    // this.tooManyUsers$.next(this.form.value.usersLimit < this.getAssignedUsers().length);
  }


  save(): void {
    this.savingOrDeleting = true;
    this.adminUsersCompaniesService.saveTMYSubscription(this.company).subscribe(
      company => {
        console.log('company', company);
        this.savingOrDeleting = false;
        this.snackBar.open('TMY subscription has been saved', null, {
          duration: 3000,
          panelClass: ['snackbarPass', 'snackbarTextCenter']
        });

        // update company in store (so when user hit BACK and open again edit of prospect -> it will be updated)
        // this.store.dispatch(CompaniesActions.companyUpdated({ company }));
        this.onCloseClick();
      },
      err => {
        console.error(err);
        this.savingOrDeleting = false;
        this.snackBar.open('TMY subscription could not be saved', null, {
          duration: 3000,
          panelClass: ['snackbarError', 'snackbarTextCenter']
        });
      }
    );
  }
  edittoken(user: any): void {

    console.log('selectedUsers',user);
    this.displayname=user?.firstName +' '+ user?.lastName;
    this.tokenDataShow = true;
    this.adminUsersCompaniesService.getUserTokens().subscribe(data => {
      this.tokenData = data;
    });
  }
  closeEditToken(): void {
    this.tokenDataShow = false;

  }
  onTabChanged(): void {
    this.tokenDataShow = false;
  }
 }
