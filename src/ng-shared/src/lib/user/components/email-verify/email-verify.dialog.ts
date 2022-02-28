import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs/operators';

import { State } from '../../reducers';
import { Auth0State, UserModuleState } from '../../types';

/**
 * Simple dialog to inform user if email verification was ok / not ok.
 */
@Component({
  selector: 'sg-email-verify-dialog',
  templateUrl: './email-verify.dialog.html',
})
export class EmailVerifyDialogComponent {

  auth0State: Auth0State;

  constructor(
    public store: Store<State>,
    public dialogRef: MatDialogRef<EmailVerifyDialogComponent>
  ) {
    this.store.select('user')
      .pipe(
        map((as: UserModuleState) => as),
        first()
      ).subscribe(authState => {
        this.auth0State = authState.auth0;
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
