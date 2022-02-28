import { TemplateRef, Type } from '@angular/core';

import { DialogActions } from '../../model/dialog-action.model';

export interface StandardDialogData<PayloadTypes extends any[] = any[]> {
  content: string | TemplateRef<any> | Type<any>;
  titleTranslationKey?: string;
  closeIconButtonEnabled?: boolean;
  dividedContent?: boolean;
  actions?: DialogActions<PayloadTypes>;
  [key: string]: any;
}
