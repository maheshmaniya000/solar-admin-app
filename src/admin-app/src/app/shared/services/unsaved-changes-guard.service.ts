import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

import { SaveableComponent } from '../models/saveable-component.model';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<SaveableComponent> {
  constructor(private readonly dialog: MatDialog) {}

  canDeactivate(component: SaveableComponent): Observable<boolean> {
    return component.hasUnsavedChanges().pipe(
      switchMap(unsavedChanges =>
        unsavedChanges
          ? this.dialog
              .open(ConfirmationDialogComponent, {
                data: {
                  heading: 'Save',
                  text:
                    'You have unsaved changes, do you want to ignore them?'
                }
              })
              .afterClosed()
          : of(true)
      )
    );
  }
}
