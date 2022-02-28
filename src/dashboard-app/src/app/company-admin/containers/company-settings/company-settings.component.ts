import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { Company } from '@solargis/types/user-company';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { UpdateCompany } from 'ng-shared/user/actions/company.actions';
import { State } from 'ng-shared/user/reducers';
import { selectActiveCompany } from 'ng-shared/user/selectors/company.selectors';
import { CompanyService } from 'ng-shared/user/services/company.service';

@Component({
  selector: 'sg-company-settings',
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss']
})
export class CompanySettingsComponent extends SubscriptionAutoCloseComponent implements OnInit {

  company$: Observable<Company>;

  editMode$ = new BehaviorSubject<boolean>(false);

  editedCompany: Company;

  isSaving = false;

  constructor(
    private readonly store: Store<State>,
    private readonly snackBar: MatSnackBar,
    private readonly companyService: CompanyService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.company$ = this.store.pipe(selectActiveCompany);
  }

  save(): void {
    if (!this.isSaving) {
      this.isSaving = true;
      this.company$.pipe(
        first(),
        switchMap(company => this.companyService.updateCompany(company.sgCompanyId, this.editedCompany)),
      ).subscribe(
        cwt => {
          this.store.dispatch(new UpdateCompany(cwt));
          this.store.dispatch(new AmplitudeTrackEvent('company_update'));
          this.editMode$.next(false);
          this.snackBar.open(
            translate('user.company.messages.update-ok'),
            null,
            { duration: 3000, panelClass: ['snackbarPass', 'snackbarTextCenter'] }
          );
          this.isSaving = false;
        },
        err => {
          console.error(err);
          this.snackBar.open(
            translate('user.company.messages.update-fail'),
            null,
            { duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter'] }
          );
          this.isSaving = false;
        });
    }
  }
}
