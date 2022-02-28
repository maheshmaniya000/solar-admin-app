import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TranslationDef } from '@solargis/types/translation';

function makeTranslationDef(translate: string | TranslationDef): TranslationDef {
  if (typeof translate === 'string') {return { translate };}
  return translate;
}

export type ConfirmationDialogOption = {
  text: TranslationDef | string;
  value: any;
  default?: boolean;
};

export type ConfirmationDialogSimpleInput = {
  heading?: string | TranslationDef;
  text?: string | TranslationDef;
  action?: string;
  noAction?: string;
};

export type ConfirmationDialogMultiInput = {
  heading?: string | TranslationDef;
  text?: string | TranslationDef;
  actions: ConfirmationDialogOption[];
};


@Component({
  selector: 'sg-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html'
})
export class ConfirmationDialogComponent implements OnInit {

  heading: string | TranslationDef;
  text: string | TranslationDef;

  actions: ConfirmationDialogOption[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogSimpleInput | ConfirmationDialogMultiInput,
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {
    if (data) {
      this.heading = makeTranslationDef(data.heading || 'common.confirmDialog.heading');
      this.text = makeTranslationDef(data.text || 'common.confirmDialog.body');

      if ((data as ConfirmationDialogMultiInput).actions) {
        this.actions = (data as ConfirmationDialogMultiInput).actions.map(
          action => {
            action.text = makeTranslationDef(action.text);
            return action;
          }
        );
      } else {
        data = data as ConfirmationDialogSimpleInput;

        this.actions = [{
          text: makeTranslationDef(data.noAction || 'common.action.cancel'),
          value: false
        }, {
          text: makeTranslationDef(data.action || 'common.action.confirm'),
          value: true,
          default: true,
        }];
      }
    } else {
      // default
      this.heading = makeTranslationDef('common.confirmDialog.heading');
      this.text = makeTranslationDef('common.confirmDialog.body');
      this.actions = [{
        text: makeTranslationDef('common.action.confirm'),
        value: true,
        default: true,
      }, {
        text: makeTranslationDef('common.action.cancel'),
        value: false
      }];
    }
  }

  ngOnInit(): void {
    // set width
    this.dialogRef.updateSize('450px');
  }

  closeDialog(value?: ConfirmationDialogOption): void {
    this.dialogRef.close(value);
  }
}
