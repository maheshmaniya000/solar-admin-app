import { Injectable, TemplateRef, Type } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { TypesToUnion } from 'ng-shared/models/types-to-union.type';

import { DialogComponent } from '../dialog.component';
import { DialogConstants } from '../dialog.constants';
import { DialogConfig } from '../model/dialog-config.model';
import { DialogKind } from '../model/dialog-kind.model';
import { StandardDialogData } from '../standard-dialog/model/standard-dialog-data.model';
import { StandardDialogComponent } from '../standard-dialog/standard-dialog.component';
import { SuccessDialogData } from '../success-dialog/models/success-dialog-data.model';
import { SuccessDialogContentComponent } from '../success-dialog/success-dialog-content.component';

type DialogConfigWithRequiredData<D> = DialogConfig<D> & Required<Pick<DialogConfig<D>, 'data'>>;

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private readonly dialog: MatDialog) {}

  openMediumDialog<R, D = any>(
    templateRefOrComponent: TemplateRef<DialogComponent> | Type<any>,
    dialogConfig: DialogConfig<D> = {}
  ): MatDialogRef<DialogComponent, R> {
    return this.open(templateRefOrComponent, dialogConfig);
  }

  openLargeDialog<R, D = any>(
    templateRefOrComponent: TemplateRef<DialogComponent> | Type<any>,
    dialogConfig: DialogConfig<D> = {}
  ): MatDialogRef<DialogComponent, R> {
    return this.open(templateRefOrComponent, {
      ...DialogConstants.defaultConfigs.large,
      ...dialogConfig
    });
  }

  openFeaturedDialog<R, D = any>(
    templateRefOrComponent: TemplateRef<DialogComponent> | Type<any>,
    dialogConfig: DialogConfig<D> = {}
  ): MatDialogRef<DialogComponent, R> {
    return this.open(templateRefOrComponent, {
      ...DialogConstants.defaultConfigs.featured,
      ...dialogConfig
    });
  }

  openStandardDialog<R extends any[]>(
    dialogConfig: DialogConfigWithRequiredData<StandardDialogData<R>>,
    kind = DialogKind.medium
  ): MatDialogRef<StandardDialogComponent, TypesToUnion<R>> {
    return this.open(StandardDialogComponent, {
      ...DialogConstants.defaultConfigs[kind],
      ...dialogConfig,
      data: {
        ...dialogConfig.data,
        closeIconButtonEnabled: dialogConfig.data.closeIconButtonEnabled ?? true
      }
    });
  }

  openConfirmationDialog(
    dialogConfig: DialogConfigWithRequiredData<StandardDialogData<[boolean]>>
  ): MatDialogRef<StandardDialogComponent, boolean> {
    return this.openStandardDialog(dialogConfig);
  }

  openSuccessDialog<R extends any[]>(
    data: SuccessDialogData<R>
  ): MatDialogRef<StandardDialogComponent, TypesToUnion<R>> {
    return this.openStandardDialog(
      {
        data: {
          content: SuccessDialogContentComponent,
          closeIconButtonEnabled: false,
          ...data
        }
      },
      DialogKind.featured
    );
  }

  private open<T, D, R>(templateRefOrComponent: TemplateRef<T> | Type<T>, dialogConfig: MatDialogConfig<D>): MatDialogRef<T, R> {
    return this.dialog.open(templateRefOrComponent, dialogConfig);
  }
}
