import { Component, Inject, TemplateRef, Type } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { StandardDialogData } from './model/standard-dialog-data.model';

@Component({
  selector: 'sg-standard-dialog',
  templateUrl: './standard-dialog.component.html'
})
export class StandardDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: StandardDialogData) {}

  isContentAString(): boolean {
    return typeof this.data.content === 'string';
  }

  isContentATemplateRef(): boolean {
    return this.data.content instanceof TemplateRef;
  }

  isContentAComponent(): boolean {
    return this.data.content instanceof Type;
  }
}
