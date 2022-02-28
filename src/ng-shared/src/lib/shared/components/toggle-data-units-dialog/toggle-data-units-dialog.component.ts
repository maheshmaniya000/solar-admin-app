import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { Dataset } from '@solargis/dataset-core';
import { latlngToggle } from '@solargis/units';

import { LTA_DATASET } from 'ng-project/project/services/lta-dataset.factory';


@Component({
  selector: 'sg-toggle-data-units-dialog',
  styleUrls: [ './toggle-data-units-dialog.component.scss' ],
  templateUrl: './toggle-data-units-dialog.component.html'
})
export class ToggleDataUnitsDialogComponent {
  toggles = [];
  toggleKeys = {};

  constructor(private readonly dialogRef: MatDialogRef<ToggleDataUnitsDialogComponent>,
              @Inject(LTA_DATASET) private readonly ltaDataset: Dataset, // TODO layers set into dialog data
              ) {

    // find unique toggles
    const toggleMap = this.ltaDataset.annual.toArray()
      .filter(layer => layer && layer.unit && layer.unit.toggle)
      .map(layer => layer.unit.toggle)
      .reduce((result, unitToggles) => result.concat(unitToggles), [])
      .reduce((result, unitToggle) => {
        result[unitToggle.settingsKey] = unitToggle;
        return result;
      }, {});

    const toggles = [latlngToggle];
    this.toggles = toggles.concat(Object.values(toggleMap));
  }

  saveDialog(): void {
    const toggleKeys = Object.entries(this.toggleKeys).map(
      ([key, elem]) => ({ settingsKey: key, toggleKey: elem })
    );

    this.dialogRef.close(toggleKeys);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
