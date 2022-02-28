import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ConfirmationDialogComponent, ConfirmationDialogOption
} from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

import { EconomyCalculatorComponent } from '../containers/economy-calculator/economy-calculator.component';

/**
 * Check if user has permission to access a route
 */
@Injectable()
export class EconomyUnsavedChangesGuard implements CanDeactivate<EconomyCalculatorComponent> {

  dialogActions: ConfirmationDialogOption[] = [{
    text: 'common.confirm.yes',
    value: 'yes',
    default: true
  }, {
    text: 'common.confirm.no',
    value: 'no'
  }, {
    text: 'common.action.cancel',
    value: 'cancel'
  }, ];

  constructor(
    private readonly dialog: MatDialog,
  ) {}

  canDeactivate(component: EconomyCalculatorComponent): Observable<boolean> | boolean {
    if (component.isChanged) {
      return this.dialog.open(ConfirmationDialogComponent, {
        disableClose: true,
        data: {
          heading: 'projectDetail.economy.guard.heading',
          text: 'projectDetail.economy.guard.text',
          actions: this.dialogActions,
        }
      }).afterClosed().pipe(
        map(result => {
          if (result === 'yes') {
            component.saveValues();
          }
          if (result !== 'cancel') {
            return true;
          } else {return false;}
        })
      );
    } else {
      return true;
    }
  }
}
