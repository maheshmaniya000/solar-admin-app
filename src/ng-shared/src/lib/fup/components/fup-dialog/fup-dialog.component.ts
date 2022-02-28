import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { OpenUserRegistration, RequireUserLogin } from '../../../user/actions/auth.actions';

/**
 * Popup dialog to confirm that user is not robot
 */
@Component({
  templateUrl: './fup-dialog.component.html',
})
export class FupDialogComponent {

  constructor(
    private readonly dialogRef: MatDialogRef<FupDialogComponent>,
    private readonly store: Store<any>
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  openLogin(): void {
    this.close();
    this.store.dispatch(new RequireUserLogin(null));
  }

  openRegistration(): void {
    this.close();
    this.store.dispatch(new OpenUserRegistration());
  }
}
