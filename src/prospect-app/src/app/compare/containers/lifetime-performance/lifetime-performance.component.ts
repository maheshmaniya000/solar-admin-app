import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, publishReplay, refCount } from 'rxjs/operators';

import { DataLayer, Dataset } from '@solargis/dataset-core';
import { computePvLifetimePerformance, PV_LIFETIME_PERFORMANCE_YEARS } from '@solargis/prospect-detail-calc';
import { AnnualDataMap } from '@solargis/types/dataset';
import { SystemPvConfig } from '@solargis/types/pv-config';
import { range } from '@solargis/types/utils';

import { State } from 'ng-project/project/reducers';
import {
  selectCompareItemsWithPvConfig,
  selectHasCompareItemsWithPvConfig
} from 'ng-project/project/selectors/compare.selectors';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { CompareChips } from '../../components/chips-selector/chips-selector.component';
import { selectCompareEnergySystemData } from '../../selectors/compare.selectors';

export const strrange = (x: number): string[] => range(x).map(i => i.toString());

@Component({
  selector: 'sg-lifetime-performance',
  templateUrl: './lifetime-performance.component.html',
  styleUrls: ['./lifetime-performance.component.scss']
})
export class LifetimePerformanceComponent extends SubscriptionAutoCloseComponent implements OnInit {

  compare: CompareItem[];
  hasCompareItems$: Observable<boolean>;

  layers = [
    this.pvcalcDataset.annual.get('PVOUT_specific'),
    this.pvcalcDataset.annual.get('PVOUT_total'),
    this.pvcalcDataset.annual.get('PR'),
  ];

  layersWithPerm$: Observable<DataLayer[]>;

  defaultSelectedChips: CompareChips = {
    PVOUT_specific: true,
  };
  selectedChips: CompareChips;

  hasData: boolean;

  columns = [];

  dataSources = {};

  constructor(
    public store: Store<State>,
    private readonly datasetService: DatasetAccessService,
    @Inject(PVCALC_DATASET) private readonly pvcalcDataset: Dataset
  ) {
    super();
  }

  ngOnInit(): void {
    this.selectedChips = { ...this.defaultSelectedChips };

    const compare$ = this.store.pipe(selectCompareItemsWithPvConfig);

    this.hasCompareItems$ = this.store.pipe(selectHasCompareItemsWithPvConfig);

    const data$ = combineLatest(
      this.store.pipe(selectCompareEnergySystemData),
      compare$
    ).pipe(
      filter(
        ([data, compare]) => compare.map(
          item => !!data[item.energySystemId]
        ).every(Boolean)
      ),
      // calculate losses
      map(([data, compare]) => compare.reduce((acc, item) => {
        const pvConfig = item.energySystem.pvConfig;
        acc[item.energySystemId] = computePvLifetimePerformance(
          data[item.energySystemId].annual.data as AnnualDataMap, pvConfig as SystemPvConfig
        );
        return acc;
      }, {})),
      distinctUntilChanged(),
      publishReplay(),
      refCount(),
    );

    // compute dataSources
    this.layers.forEach(layer => {
      this.dataSources[layer.key] = combineLatest(
        data$,
        compare$
      ).pipe(
        debounceTime(30),
        map(([data, compare]) => {
          const rows = range(PV_LIFETIME_PERFORMANCE_YEARS).map(year => {
            const compareData = compare.map(i => data[i.energySystemId] && data[i.energySystemId][year + 1][layer.key]);
            return {
              year: year.toString(),
              ...Object.assign([], compareData)
            };
          });

          // FIXME remove hardcoded indexes - 26, 27 - this will lead to errors later

          // avg
          const avg = compare.map(i => data[i.energySystemId] && data[i.energySystemId][26][layer.key]);
          rows.push({
            year: 'avg',
            ...Object.assign([], avg)
          });

          // sum
          if (layer.key === 'PVOUT_total') {
            const sum = compare.map(i => data[i.energySystemId] && data[i.energySystemId][27][layer.key]);
            rows.push({
              year: 'sum',
              ...Object.assign([], sum)
            });
          }

          return rows;
        })
      );
    });

    this.addSubscription(
      data$.subscribe(
        data => this.hasData = !!data
      )
    );

    this.addSubscription(
      compare$.subscribe(
        compare => {
          this.compare = compare;
          this.columns = ['endOfYear', ...strrange(compare.length)];
        }
      )
    );

    this.layersWithPerm$ = this.datasetService.filterLayersByPermissions(this.layers);
  }

  onSelect(selectedChips: CompareChips): void {
    this.selectedChips = selectedChips;
  }
}
