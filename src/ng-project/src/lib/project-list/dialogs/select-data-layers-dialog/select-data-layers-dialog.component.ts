import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { Dataset, DataLayerMap } from '@solargis/dataset-core';

import { ProjectListDataTabState } from 'ng-shared/core/reducers/layout.reducer';
import { selectLayoutProjectListDataTab } from 'ng-shared/core/selectors/layout.selector';

import { LTA_DATASET } from '../../../project/services/lta-dataset.factory';
import { PVCALC_DATASET } from '../../../project/services/pvcalc-dataset.factory';
import { State } from '../../reducers/index';

@Component({
  selector: 'sg-select-data-layers-dialog',
  styleUrls: [ './select-data-layers-dialog.component.scss' ],
  templateUrl: './select-data-layers-dialog.component.html'
})
export class SelectDataLayersDialogComponent implements OnInit {
  isSelectedLta: { [key: string]: boolean };
  isSelectedPvcalc: { [key: string]: boolean };

  isDisabledLta: { [key: string]: boolean };
  isDisabledPvcalc: { [key: string]: boolean };

  ltaKeys: string[];
  pvcalcKeys: string[];
  dataTab: ProjectListDataTabState;

  initialSelectedLtaKeys: string[];
  initialSelectedPvcalcKeys: string[];

  dataTabIndex$: Observable<number>;
  dialogTitle: string;

  constructor(private readonly dialogRef: MatDialogRef<SelectDataLayersDialogComponent>,
              private readonly store: Store<State>,
              @Inject(LTA_DATASET) public ltaDataset: Dataset,
              @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset,
              @Inject(MAT_DIALOG_DATA) data: any) {
    this.initialSelectedLtaKeys = data.selectedLtaKeys;
    const ltaAnnualLayers = data.ltaAnnualLayers;

    this.ltaKeys = ltaDataset.annual.keys;
    this.isDisabledLta = this.isDisabled(this.ltaKeys, ltaAnnualLayers);
    this.isSelectedLta = this.isSelected(this.ltaKeys, this.initialSelectedLtaKeys, this.isDisabledLta);

    this.initialSelectedPvcalcKeys = data.selectedPvcalcKeys;
    const pvcalcAnnualLayers = data.pvcalcAnnualLayers;

    this.pvcalcKeys = pvcalcDataset.annual.keys;
    this.isDisabledPvcalc = this.isDisabled(this.pvcalcKeys, pvcalcAnnualLayers);
    this.isSelectedPvcalc = this.isSelected(this.pvcalcKeys, this.initialSelectedPvcalcKeys, this.isDisabledPvcalc);

    this.dialogTitle = data.componentName === 'map'
    ? 'project.dataSettings.mapViewSettings'
    : 'project.dataSettings.projectViewSettings';
  }

  ngOnInit(): void {
    this.dataTabIndex$ = this.store.pipe(
      selectLayoutProjectListDataTab,
      map(dataTab => dataTab === 'mapData' ? 0 : 1),
      distinctUntilChanged()
    );
  }

  isSelected(keys: string[], selectedKeys: string[], isDisabledMap: { [key: string]: boolean }): any {
    return keys.reduce((res, key) => {
      res[key] = selectedKeys && selectedKeys.includes(key) && !isDisabledMap[key];
      return res;
    }, {});
  }

  isDisabled(dataLayers: string[], layersWithAccess: DataLayerMap): any {
    return dataLayers.reduce((res, key) => {
      const layer = layersWithAccess.get(key);
      res[key] = !layer.accessGranted;
      return res;
    }, {});
  }

  saveDialog(): void {
    const ltaKeys = this.ltaKeys
      .filter(key => this.isSelectedLta[key] || (this.isDisabledLta[key] && this.initialSelectedLtaKeys.includes(key)));

    const pvcalcKeys = this.pvcalcKeys
      .filter(key => this.isSelectedPvcalc[key] || (this.isDisabledPvcalc[key] && this.initialSelectedPvcalcKeys.includes(key)));

    this.dialogRef.close({ ltaKeys, pvcalcKeys, dataTabValue: this.dataTab });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  selectAll(type: 'lta' | 'pvcalc', selected: boolean): void {
    if (type === 'lta') {
      this.isSelectedLta = this.ltaKeys.reduce((res, key) => (res[key] = this.isDisabledLta[key] ? false : selected, res), {});
    }
    if (type === 'pvcalc') {
      this.isSelectedPvcalc = this.pvcalcKeys.reduce((res, key) => (res[key] = this.isDisabledPvcalc[key] ? false : selected, res), {});
    }
  }

  dataTabChange(tabIndex: number): void {
    this.dataTab = tabIndex === 0 ? 'mapData' : 'projectData';
  }
}
