import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { filter, switchMap, first } from 'rxjs/operators';

import { StorageProviderService } from 'ng-shared/core/services/storage-provider.service';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { selectUser } from '../../../user/selectors/auth.selectors';
import { UserService } from '../../../user/services/user.service';
import { UserReloadData } from '../../actions/auth.actions';
import { ReloadCompanyList } from '../../actions/company.actions';
import { State } from '../../reducers';
import { Auth0Service } from '../../services/auth0.service';


export const sg1TermsConfirmedStorageKey = 'sg1_terms_confirmed';

/**
 * Simple dialog to confirm SG2 Terms
 */
@Component({
  selector: 'sg-confirm-terms-dialog',
  templateUrl: './confirm-terms.dialog.html',
})
export class ConfirmTermsDialogComponent extends SubscriptionAutoCloseComponent {

  sgAccountId: string;

  form: FormGroup;
  confirmed = false;

  checkInProgress = false;

  get firstName(): any { return this.form.get('firstName'); }
  get lastName(): any { return this.form.get('lastName'); }

  constructor(
    public dialogRef: MatDialogRef<ConfirmTermsDialogComponent>,
    private readonly fb: FormBuilder,
    private readonly auth0Service: Auth0Service,
    private readonly userService: UserService,
    private readonly store: Store<State>,
    private readonly storageProvider: StorageProviderService,
  ) {
    super();

    this.form = this.fb.group({
      firstName: [undefined, [ Validators.required ]],
      lastName: [undefined, [ Validators.required ]]
    });

    this.addSubscription(
      this.store.pipe(selectUser, filter(x => !!x)).subscribe(u => this.sgAccountId = u.sgAccountId)
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  confirmTerms(): void {
    if (!this.checkInProgress) {
      this.checkInProgress = true;
      const { firstName, lastName } = this.form.value;

      this.auth0Service.confirmTerms().pipe(
        switchMap(() => this.userService.updateUser(this.sgAccountId, { firstName, lastName })),
        first()
      ).subscribe(() => {
        this.store.dispatch(new ReloadCompanyList());
        this.store.dispatch(new UserReloadData());

        const storage = this.storageProvider.getSessionStorage();
        storage.setItem(sg1TermsConfirmedStorageKey, this.sgAccountId);

        this.dialogRef.close({confirmDone: true});
      }, () => this.checkInProgress = false);
    }
  }
}
