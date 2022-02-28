import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './expire-order-dialog.component.html',
  styleUrls: ['./expire-order-dialog.component.scss']
})
export class ExpireOrderDialogComponent {

  disabled = true;
  constructor(
    private readonly dialogRef: MatDialogRef<ExpireOrderDialogComponent>,
  ) { }

  close(payload: boolean): void {
    this.dialogRef.close(payload);
  }

  change(event: MatCheckboxChange): void {
    this.disabled = !event.checked;
  }
}
