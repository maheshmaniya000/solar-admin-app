import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

import { computePvLosses, isRefRow, lossDefs, translateLossesRowKey } from '@solargis/prospect-detail-calc';
import { Unit, units } from '@solargis/units';

import { State } from 'ng-project/project/reducers';
import {
  selectCompareItemsWithPvConfig,
  selectHasCompareItemsWithPvConfig
} from 'ng-project/project/selectors/compare.selectors';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { selectCompareEnergySystemData } from '../../selectors/compare.selectors';
import { strrange } from '../lifetime-performance/lifetime-performance.component';

@Component({
  selector: 'sg-performance-losses',
  templateUrl: './performance-losses.component.html',
  styleUrls: ['./performance-losses.component.scss']
})
export class PerformanceLossesComponent extends SubscriptionAutoCloseComponent implements OnInit {

  compare: CompareItem[];
  hasCompareItems$: Observable<boolean>;

  unit: Unit = units['%'];

  dataSource$: Observable<any>;
  columns = [];

  translateRowKey = translateLossesRowKey;
  isRefRow = isRefRow;

  showAbsValues$ = new BehaviorSubject(false);

  constructor(public store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    const compare$ = this.store.pipe(selectCompareItemsWithPvConfig);

    this.hasCompareItems$ = this.store.pipe(selectHasCompareItemsWithPvConfig);

    const data$ = this.store.pipe(selectCompareEnergySystemData);

    this.dataSource$ = combineLatest([
        compare$,
        data$,
        this.showAbsValues$
      ]
    ).pipe(
      debounceTime(50),
      filter(
        ([compare, data]) => compare.map(
          item => data[item.energySystemId].annual && data[item.energySystemId]['energy-stages']
        ).every(Boolean)
      ),
      // calculate losses
      map(([compare, data, showAbsoluteValues]) => {
        const pvLosssesDataMap = compare.reduce((acc, item) => {
          const pvLossesMap = computePvLosses(data[item.energySystemId]).reduce(
            (mapAcc, losses) => {
              mapAcc[losses.loss || losses.key] = losses;
              return mapAcc;
            },
            {}
          );

          acc[item.energySystemId] = pvLossesMap;
          return acc;
        }, {});

        const rows = lossDefs.map(lossType => {
          const compareData = compare.map(
            item => showAbsoluteValues
              ? pvLosssesDataMap[item.energySystemId][lossType.loss || lossType.key].energyDelta
              : pvLosssesDataMap[item.energySystemId][lossType.loss || lossType.key].lossPercent
          );
          return {
            ...lossType,
            ...Object.assign([], compareData)
          };
        });

        // add empty row above GTI
        if (!lossDefs.find(lossType => lossType.key === 'emptyRow')) {
          lossDefs.splice(4, 0, {key: 'emptyRow', group: 'ghi'});
        }

        return rows;
      }),
    );

    this.addSubscription(
      compare$.subscribe(
        compare => {
          this.compare = compare;
          this.columns = ['label', ...strrange(compare.length)];
        }
      )
    );
  }

  toggleValues(event): void {
    event.checked ? this.showAbsValues$.next(true) : this.showAbsValues$.next(false);
    event.checked ? this.unit = units['kWh/m2'].default : this.unit = units['%'];
  }
}
