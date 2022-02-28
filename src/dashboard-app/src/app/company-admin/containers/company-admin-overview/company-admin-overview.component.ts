import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';

import { Company, ProspectLicenseType } from '@solargis/types/user-company';

import { State } from 'ng-shared/core/reducers';
import { selectActiveCompany } from 'ng-shared/user/selectors/company.selectors';
import { CompanyService } from 'ng-shared/user/services/company.service';

import { IAlreadyHaveImapsDialogComponent } from '../../components/i-already-have-imaps-dialog/i-already-have-imaps-dialog.component';

@Component({
  selector: 'sg-company-admin-overview',
  templateUrl: './company-admin-overview.component.html',
  styleUrls: ['./company-admin-overview.component.scss']
})
export class CompanyAdminOverviewComponent implements OnInit {

  company$: Observable<Company>;
  hasProspectLicense$: Observable<boolean>;

  sg1LicenseDisabled: boolean;

  constructor(
    private readonly dialog: MatDialog,
    private readonly companyService: CompanyService,
    private readonly store: Store<State>,
    private readonly snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.company$ = this.store.pipe(selectActiveCompany);

    this.hasProspectLicense$ = this.company$.pipe(
      map((c: Company) => c.prospectLicense && c.prospectLicense.licenseType
        && c.prospectLicense.licenseType !== ProspectLicenseType.FreeTrial
      ),
    );
  }

  redeemProspectLicense(): void {
    this.dialog.open(IAlreadyHaveImapsDialogComponent, {
      minWidth: '450px'
    }).afterClosed().pipe(
      filter(x => !!x),
      switchMap(() => this.company$.pipe(first())),
      switchMap(company => this.companyService.requestLicenseFromSG1(company).pipe(map(() => company))),
    ).subscribe(() => {
      this.snackBar.open(
        translate('companyAdmin.overview.prospectSubscription.snack'),
        null,
        { duration: 3000, panelClass: ['snackbarPass', 'snackbarTextCenter'] }
      );
      this.sg1LicenseDisabled = true;
    });
  }
}
