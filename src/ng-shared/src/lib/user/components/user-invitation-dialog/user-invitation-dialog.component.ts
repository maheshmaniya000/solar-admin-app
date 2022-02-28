import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * Popup dialog to accept invitation
 */
@Component({
  templateUrl: './user-invitation-dialog.component.html',
})
export class UserInvitationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<UserInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  accept(): void {
    if (this.data && this.data.notRegistered) {
      this.dialogRef.close({
        openRegistration: true
      });
    } else {
      this.dialogRef.close({
        claimTrial: true
      });
    }
  }
}
