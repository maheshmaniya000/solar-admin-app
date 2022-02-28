import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { DataLayer, Dataset, } from '@solargis/dataset-core';

import { State } from 'ng-project/project/reducers';
import {
  selectCompareItemsWithPvConfig,
  selectHasCompareItemsWithPvConfig
} from 'ng-project/project/selectors/compare.selectors';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { CompareItem } from 'ng-project/project/types/compare.types';

import { CompareDataMap } from '../../compare.types';
import { CompareChips } from '../../components/chips-selector/chips-selector.component';
import { selectCompareEnergySystemData } from '../../selectors/compare.selectors';

@Component({
  selector: 'sg-pv-electricity-monthly',
  templateUrl: './pv-electricity-monthly.component.html',
  styleUrls: ['./pv-electricity-monthly.component.scss']
})
export class PvElectricityMonthlyComponent implements OnInit {

  compare$: Observable<CompareItem[]>;
  hasCompareItems$: Observable<boolean>;

  defaultSelectedChips: CompareChips = {
    PVOUT_specific: true,
  };
  selectedChips: CompareChips;

  data$: Observable<CompareDataMap>;

  layers = [
    this.pvcalcDataset.monthly.get('GTI'),
    this.pvcalcDataset.monthly.get('PVOUT_specific'),
    this.pvcalcDataset.monthly.get('PVOUT_total'),
  ];

  layersWithPerm$: Observable<DataLayer[]>;

  constructor(
    public store: Store<State>,
    private readonly datasetService: DatasetAccessService,
    @Inject(PVCALC_DATASET) private readonly pvcalcDataset: Dataset
  ) { }

  ngOnInit(): void {
    this.selectedChips = { ...this.defaultSelectedChips };
    this.compare$ = this.store.pipe(selectCompareItemsWithPvConfig );
    this.hasCompareItems$ = this.store.pipe(selectHasCompareItemsWithPvConfig);
    this.data$ = this.store.pipe(selectCompareEnergySystemData);
    this.layersWithPerm$ = this.datasetService.filterLayersByPermissions(this.layers);
  }

  onSelect(selectedChips: CompareChips): void {
    this.selectedChips = selectedChips;
  }
}
