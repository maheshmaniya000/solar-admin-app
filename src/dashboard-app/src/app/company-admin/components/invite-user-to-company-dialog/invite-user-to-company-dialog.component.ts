import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { AppSubscription, Company, SolargisApp } from '@solargis/types/user-company';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { getAppSubscription, hasAppSubscriptionSlot } from 'ng-shared/user/utils/company.utils';
import { emailValidator } from 'ng-shared/user/utils/email.validator';


@Component({
  selector: 'sg-invite-user-to-company-dialog',
  templateUrl: './invite-user-to-company-dialog.component.html',
  styleUrls: ['./invite-user-to-company-dialog.component.scss']
})
export class InviteUserToCompanyDialogComponent implements OnInit {
  hasAppsSubscriptionSpot: { prospect: boolean; sdat: boolean };

  group: FormGroup;
  addToAppsSubscription: { prospect: boolean; sdat: boolean };

  working = false;
  isValid = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public company: Company,
    private readonly dialogRef: MatDialogRef<InviteUserToCompanyDialogComponent>,
    private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
    private readonly snackBar: MatSnackBar,
    private readonly store: Store<any>,
  ) { }

  ngOnInit(): void {
    this.group = this.fb.group({
      email: [undefined, [ Validators.required, emailValidator ]]
    });

    this.hasAppsSubscriptionSpot = { prospect: this.hasSubscriptionSlot('prospect'), sdat: this.hasSubscriptionSlot('sdat') };
    this.addToAppsSubscription = { ...this.hasAppsSubscriptionSpot };
  }

  saveDialog(): void {
    if (!this.group.invalid) {
      this.working = true;
      this.group.controls.email.disable();
      const inviteEmail = this.group.value.email;
      const subscriptionApps = Object.keys(this.addToAppsSubscription).filter(key => this.addToAppsSubscription[key]) as SolargisApp[];

      this.companyService
        .inviteUserToCompany(this.company, inviteEmail, subscriptionApps)
        .pipe(first())
        .subscribe(
          () => this.dialogRef.close(true),
          (errRes: HttpErrorResponse) => {
            this.working = false;
            this.group.controls.email.enable();

            if (errRes?.error?.error === 'company.user.already_invited') {
              this.snackBar.open(
                translate('companyAdmin.users.alreadyInvited', { companyName: this.company.name}),
                null,
                { duration: 5000 }
              );
            } else {
              this.snackBar.open(translate('common.error.failed'), null, { duration: 5000 });
            }
          });

      this.store.dispatch(new AmplitudeTrackEvent('company_invite'));
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getSubscription(app: 'prospect' | 'sdat'): AppSubscription {
    return getAppSubscription(this.company, app);
  }

  hasSubscriptionSlot(app: 'prospect' | 'sdat'): boolean {
    return hasAppSubscriptionSlot(this.company, app);
  }

}
