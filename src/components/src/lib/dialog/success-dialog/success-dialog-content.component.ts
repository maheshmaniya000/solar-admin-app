import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SuccessDialogData } from './models/success-dialog-data.model';

@Component({
  templateUrl: './success-dialog-content.component.html',
  styleUrls: ['./success-dialog-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessDialogContentComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: SuccessDialogData) {}
}
