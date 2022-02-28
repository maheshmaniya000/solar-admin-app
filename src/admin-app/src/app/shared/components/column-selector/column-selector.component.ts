import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { intersection } from 'lodash-es';
import { isEmpty } from 'lodash-es';
import { isNil } from 'lodash-es';
import { filter } from 'rxjs/operators';

import { ensureArray } from '@solargis/types/utils';

import { AdminActions, fromAdmin } from '../../../store';
import { Column, ColumnSelectorDialogComponent, ColumnSelectorDialogData } from '../../dialogs/column-selector-dialog.component';

@Component({
  selector: 'sg-admin-column-selector',
  templateUrl: './column-selector.component.html'
})
export class ColumnSelectorComponent<T extends string> {
  @Input() tableName: string;
  @Input() columns: Omit<Column<T>, 'selected'>[];
  @Input() selected: T[];

  constructor(private readonly dialog: MatDialog, private readonly store: Store<fromAdmin.State>) {}

  onOpenColumnSelectorDialogButtonClick(): void {
    this.dialog
      .open<ColumnSelectorDialogComponent<T>, ColumnSelectorDialogData<T>, string[]>(ColumnSelectorDialogComponent, {
        data: {
          columns: this.columns.map(column => ({
            ...column,
            selected: !isEmpty(intersection(ensureArray(column.props), this.selected))
          }))
        }
      })
      .afterClosed()
      .pipe(filter(result => !isNil(result)))
      .subscribe(result =>
        this.store.dispatch(
          AdminActions.updateColumnsSettings({
            table: this.tableName,
            columns: result
          })
        )
      );
  }
}
