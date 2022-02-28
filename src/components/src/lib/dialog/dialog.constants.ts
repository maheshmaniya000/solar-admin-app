import { MatDialogConfig } from '@angular/material/dialog';

import { DialogAction } from './model/dialog-action.model';
import { DialogKind } from './model/dialog-kind.model';

type DialogActionKind = 'cancel' | 'ok' | 'delete' | 'change';

export class DialogConstants {
  static readonly confirmAction: Omit<DialogAction<true>, 'textTranslationKey' | 'dataTest'> = {
    dismissing: false,
    payload: true
  };

  static readonly actions: Record<DialogActionKind, DialogAction<boolean>> = {
    cancel: {
      dismissing: true,
      textTranslationKey: 'common.action.cancel',
      payload: false,
      dataTest: 'cancel-action-button'
    },
    ok: {
      ...DialogConstants.confirmAction,
      textTranslationKey: 'common.action.ok',
      dataTest: 'ok-action-button'
    },
    delete: {
      ...DialogConstants.confirmAction,
      textTranslationKey: 'common.action.delete',
      dataTest: 'delete-action-button'
    },
    change: {
      ...DialogConstants.confirmAction,
      textTranslationKey: 'common.action.change',
      dataTest: 'change-action-button'
    }
  };

  private static readonly sgDialogContainerClass = 'sg-dialog-container';
  private static readonly sgLargeDialogContainerClass = 'large';
  private static readonly sgFeaturedDialogContainerClass = 'featured';
  private static readonly defaultMediumDialogWidth = '608px';
  private static readonly defaultLargeDialogWidth = '640px';

  static readonly defaultConfigs: Record<DialogKind, MatDialogConfig> = {
    medium: {
      ...new MatDialogConfig(),
      panelClass: DialogConstants.sgDialogContainerClass,
      width: DialogConstants.defaultMediumDialogWidth
    },
    large: {
      ...new MatDialogConfig(),
      panelClass: [
        DialogConstants.sgDialogContainerClass,
        DialogConstants.sgLargeDialogContainerClass
      ],
      width: DialogConstants.defaultLargeDialogWidth
    },
    featured: {
      ...new MatDialogConfig(),
      panelClass: [
        DialogConstants.sgDialogContainerClass,
        DialogConstants.sgLargeDialogContainerClass,
        DialogConstants.sgFeaturedDialogContainerClass
      ],
      width: DialogConstants.defaultLargeDialogWidth
    }
  };

  static createStandardDialogDefaultActions<T>(
    okActionPayload?: T,
    okActionDisabled: boolean = false
  ): [DialogAction<undefined>, DialogAction<T>] {
    return [
      { ...DialogConstants.actions.cancel, payload: undefined },
      {
        ...DialogConstants.actions.ok,
        payload: okActionPayload,
        disabled: okActionDisabled
      }
    ];
  }
}
