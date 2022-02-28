import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { Dataset } from '@solargis/dataset-core';

import { State } from 'ng-project/project/reducers';
import { LTA_DATASET } from 'ng-project/project/services/lta-dataset.factory';
import { SettingsSelectSolarMeteoTableKeys } from 'ng-shared/core/actions/settings.actions';

@Component({
  selector: 'sg-solar-meteo-table-settings-dialog',
  templateUrl: 'solar-meteo-table-settings-dialog.component.html',
  styleUrls: ['solar-meteo-table-settings-dialog.component.scss']
})
export class SolarMeteoTableSettingsDialogComponent implements OnInit {
  isSelected: { [key: string]: boolean };

  constructor(
    private readonly store: Store<State>,
    private readonly dialogRef: MatDialogRef<SolarMeteoTableSettingsDialogComponent>,
    @Inject(LTA_DATASET) public ltaDataset: Dataset,
    @Inject(MAT_DIALOG_DATA) public data: { layerList: string[]; selectedLayers: string[] }
  ) {
  }

  ngOnInit(): void {
    this.isSelected = this.data.layerList.reduce((acc, layer) => {
      acc[layer] = false;
      return acc;
    }, {});
    this.data.selectedLayers.forEach(layer => {
      if (this.isSelected[layer] !== undefined) {this.isSelected[layer] = true;}
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveDialog(): void {
    const selectedLayers = Object.entries(this.isSelected)
      .map(([key, value]) => { if (value) {return key;} })
      .filter(i => i);
    this.store.dispatch(new SettingsSelectSolarMeteoTableKeys(selectedLayers));
    this.closeDialog();
  }

  checkBulkAllCheckboxes(check: boolean): void {
    this.data.layerList.forEach(layer => {
      this.isSelected[layer] = check;
    });
  }
}
