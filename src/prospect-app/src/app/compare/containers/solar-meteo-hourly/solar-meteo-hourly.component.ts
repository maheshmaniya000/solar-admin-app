import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { DataLayer, Dataset } from '@solargis/dataset-core';

import { State } from 'ng-project/project/reducers';
import { selectCompareItems } from 'ng-project/project/selectors/compare.selectors';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { CompareItem } from 'ng-project/project/types/compare.types';

import { CompareDataMap } from '../../compare.types';
import { CompareChips } from '../../components/chips-selector/chips-selector.component';
import { selectCompareAppData } from '../../selectors/compare.selectors';

@Component({
  selector: 'sg-solar-meteo-hourly',
  templateUrl: './solar-meteo-hourly.component.html',
  styleUrls: ['./solar-meteo-hourly.component.scss']
})
export class SolarMeteoHourlyComponent implements OnInit {

  compare$: Observable<CompareItem[]>;

  layers = [
    this.pvcalcDataset['monthly-hourly'].get('GHI'),
    this.pvcalcDataset['monthly-hourly'].get('DNI'),
    this.pvcalcDataset['monthly-hourly'].get('DIF'),
    this.pvcalcDataset['monthly-hourly'].get('TEMP'),
  ];

  layersWithPerm$: Observable<DataLayer[]>;

  defaultSelectedChips: CompareChips = {
    GHI: true,
    DNI: true,
    DIF: true
  };
  selectedChips: CompareChips;

  data$: Observable<CompareDataMap>;

  constructor(
    public store: Store<State>,
    private readonly datasetService: DatasetAccessService,
    @Inject(PVCALC_DATASET) private readonly pvcalcDataset: Dataset
  ) { }

  ngOnInit(): void {
    this.selectedChips = { ...this.defaultSelectedChips };
    this.compare$ = this.store.pipe(selectCompareItems);
    this.data$ = this.store.pipe(selectCompareAppData);
    this.layersWithPerm$ = this.datasetService.filterLayersByPermissions(this.layers);
  }

  onSelect(selectedChips: CompareChips): void {
    this.selectedChips = selectedChips;
  }
}
