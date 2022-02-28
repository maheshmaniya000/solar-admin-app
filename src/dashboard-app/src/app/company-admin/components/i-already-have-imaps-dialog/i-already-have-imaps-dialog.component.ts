import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'sg-i-already-have-imaps-dialog',
  templateUrl: './i-already-have-imaps-dialog.component.html',
  styleUrls: ['./i-already-have-imaps-dialog.component.scss']
})
export class IAlreadyHaveImapsDialogComponent {

  checked = false;

  constructor(
    public dialogRef: MatDialogRef<IAlreadyHaveImapsDialogComponent>,
  ) { }

  closeDialog(confirm = false): void {
    this.dialogRef.close(confirm && this.checked);
  }
}
