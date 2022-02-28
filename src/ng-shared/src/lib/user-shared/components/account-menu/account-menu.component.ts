import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import {
  Company,
  ProspectLicenseType,
  CompanyWithToken,
  User
} from '@solargis/types/user-company';

import { prospectPricingUrl } from 'ng-shared/shared/utils/url.utils';

import {
  SelectCompany,
  UnselectCompany
} from '../../../user/actions/company.actions';
import { State } from '../../../user/reducers';
import {
  selectUser,
  selectUserData
} from '../../../user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from '../../../user/selectors/company.selectors';
import { selectIsUserAdmin } from '../../../user/selectors/permissions.selectors';
import { AuthenticationService } from '../../../user/services/authentication.service';
import { AddCompanyDialogComponent } from '../../components/add-company-dialog/add-company-dialog.component';


@Component({
  selector: 'sg-account-menu',
  styleUrls: ['./account-menu.component.scss'],
  templateUrl: './account-menu.component.html'
})
export class AccountMenuComponent implements OnInit {
  @Input() companyList: CompanyWithToken[];
  @Input() selected: Company;
  @Input() sgAccountId: string;
  @Input() user: User;
  @Input() nested = false; // is account menu nested in another popup?

  @Output() closeParent = new EventEmitter();

  user$: Observable<User>;
  userData$: Observable<User>;
  company$: Observable<Company>;
  prospectLicenseButton$: Observable<string>;
  isAdmin$: Observable<boolean>;

  constructor(
    public authenticationService: AuthenticationService,
    private readonly store: Store<State>,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.user$ = this.store.pipe(selectUser);
    this.company$ = this.store.pipe(selectActiveOrNoCompany);
    this.userData$ = this.store.pipe(selectUserData);
    this.isAdmin$ = this.store.pipe(selectIsUserAdmin);

    this.prospectLicenseButton$ = this.company$.pipe(
      map((company: Company) => {
        if (company) {
          const { prospectLicense } = company;
          if (prospectLicense) {
            const { licenseType } = prospectLicense;
            switch (licenseType) {
              case ProspectLicenseType.Pro:
              case ProspectLicenseType.Basic:
                return 'NONE';
            }
          } else {return 'FREETRIAL';}
        }
        return 'PRICING';
      }),
      startWith('PRICING')
    );
  }

  redirectToPricing(): void {
    window.open(prospectPricingUrl, '_blank');
  }

  addNewCompany(): void {
    this.dialog.open(AddCompanyDialogComponent);
    this.closeParentIfNested();
  }

  logout(): void {
    this.authenticationService.logout();
    this.closeParentIfNested();
  }

  selectCompany(company: CompanyWithToken): void {
    if (company.company) {
      this.store.dispatch(new SelectCompany(company.company.sgCompanyId));
    } else {
      this.store.dispatch(new UnselectCompany());
    }
  }

  closeParentIfNested(): void {
    if (this.nested) {this.closeParent.emit();}
  }
}
