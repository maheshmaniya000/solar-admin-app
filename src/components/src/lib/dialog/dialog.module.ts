import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogModule,
  MAT_DIALOG_DEFAULT_OPTIONS
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

import { DialogComponent } from './dialog.component';
import { DialogConstants } from './dialog.constants';
import { DialogFooterDirective } from './footer-content/dialog-footer.directive';
import { StandardDialogComponent } from './standard-dialog/standard-dialog.component';
import { SuccessDialogContentComponent } from './success-dialog/success-dialog-content.component';

@NgModule({
  declarations: [
    StandardDialogComponent,
    DialogComponent,
    DialogFooterDirective,
    SuccessDialogContentComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    TranslocoModule
  ],
  exports: [
    MatDialogActions,
    StandardDialogComponent,
    DialogComponent,
    DialogFooterDirective,
    MatDialogClose
  ],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: DialogConstants.defaultConfigs.medium
    }
  ]
})
export class DialogModule {}
