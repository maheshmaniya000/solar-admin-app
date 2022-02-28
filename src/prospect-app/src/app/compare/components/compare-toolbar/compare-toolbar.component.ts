import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { AddToCompareDialogComponent } from 'ng-project/project/dialogs/add-to-compare-dialog/add-to-compare-dialog.component';
import { SettingsToggles as SettingsToggleAction } from 'ng-shared/core/actions/settings.actions';
import { State } from 'ng-shared/core/reducers';
import { ToggleDataUnitsDialogComponent } from 'ng-shared/shared/components/toggle-data-units-dialog/toggle-data-units-dialog.component';

import { CompareRoute } from '../../compare.routes';

@Component({
  selector: 'sg-compare-toolbar',
  templateUrl: './compare-toolbar.component.html',
  styleUrls: ['./compare-toolbar.component.scss'],
})
export class CompareToolbarComponent {

  @Input() route: CompareRoute;

  constructor(private readonly dialog: MatDialog, private readonly store: Store<State>) { }

  compare(): void {
    this.dialog.open(
      AddToCompareDialogComponent,
      {
        data:
          {sortBy: 'isSelected', order: 'desc'}
      }
    );
  }

  openUnitSettings(): void {
    this.dialog.open(ToggleDataUnitsDialogComponent, {}).afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result) {
          this.store.dispatch(new SettingsToggleAction(result));
        }
      });
  }
}
