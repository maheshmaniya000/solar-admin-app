import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { DataLayer, Dataset } from '@solargis/dataset-core';

import { State } from 'ng-project/project/reducers';
import { selectCompareItems } from 'ng-project/project/selectors/compare.selectors';
import { LTA_PVCALC_COMBINED_DATASET } from 'ng-project/project/services/combined-dataset.factory';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { CompareItem } from 'ng-project/project/types/compare.types';

import { CompareDataMap } from '../../compare.types';
import { CompareChips } from '../../components/chips-selector/chips-selector.component';
import { selectCompareAppData } from '../../selectors/compare.selectors';

@Component({
  selector: 'sg-solar-meteo-monthly',
  templateUrl: './solar-meteo-monthly.component.html',
  styleUrls: ['./solar-meteo-monthly.component.scss']
})
export class SolarMeteoMonthlyComponent implements OnInit {

  compare$: Observable<CompareItem[]>;

  layers = ['GHI', 'DNI', 'DIF', 'D2G', 'TEMP', 'WS', 'RH', 'PREC', 'PWAT', 'SNOWD', 'ALB', 'CDD', 'HDD']
    .map(key => this.dataset.monthly.get(key));

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
    @Inject(LTA_PVCALC_COMBINED_DATASET) private readonly dataset: Dataset
  ) {}

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
