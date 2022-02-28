import { Component } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { Config } from '../../../config';

@Component({
  templateUrl: './token.dialog.html',
  styleUrls: ['../app-subscription-users/app-subscription-users.component.scss']
})
export class TokenDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<TokenDialogComponent>,
    private readonly fb: FormBuilder,
    public config: Config,
    private readonly store: Store<any>
  ) {  }

  close(): void {
    this.dialogRef.close();
  }
}
