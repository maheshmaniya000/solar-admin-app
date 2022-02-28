import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Options, SeriesOptions } from 'highcharts';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';

import { DataLayer } from '@solargis/dataset-core';
import { resolveUnit$ } from '@solargis/ng-unit-value';
import { DataResolution, DatasetData } from '@solargis/types/dataset';
import { Unit, UnitResolution } from '@solargis/units';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { State } from 'ng-shared/core/reducers';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { months, monthsTranslated$, yearly } from 'ng-shared/utils/translation.utils';

import { compareColors } from '../../compare.colors';
import { CompareDataMap, CompareDataResolvedMap } from '../../compare.types';
import { strrange } from '../../containers/lifetime-performance/lifetime-performance.component';
import { calculateDiffs, CompareMonth, ComparePeriod, getLayersDiffs } from '../../utils/compare-layers.utils';
import { resolveCompareUnitValuesMap$ } from '../../utils/unit-value-compare.utils';
import { baseCompareChartType, getCompareMonthlyChart } from './compare-monthly-statistics.chart';

export function isDataLoaded(data: CompareDataMap, compare: CompareItem[], resolution: DataResolution[]): boolean {
  return compare.every(item =>
    !!data[item.energySystemId] && resolution.every(r => !!data[item.energySystemId][r])
  );
}

@Component({
  selector: 'sg-compare-monthly-statistics',
  templateUrl: './compare-monthly-statistics.component.html',
  styleUrls: ['./compare-monthly-statistics.component.scss']
})
export class CompareMonthlyStatisticsComponent extends SubscriptionAutoCloseComponent implements OnInit {

  @Input() layer: DataLayer;
  @Input() annualUnit: Unit;
  @Input() compare$: Observable<CompareItem[]>;
  @Input() data$: Observable<CompareDataMap>;

  @Output() onClose = new EventEmitter<null>();

  loading$: Observable<boolean>;
  table$: Observable<any[]>;
  columns$: Observable<any[]>;
  chart$: Observable<Options>;

  unitToggle$: Observable<any>;

  isProjectSelected = false;

  yMaxDynamic: number;
  yMinDynamic: number;

  compareChanged$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    public projectNamePipe: ProjectNamePipe,
    public transloco: TranslocoService,
    public store: Store<State>,
  ) {
    super();
    this.unitToggle$ = this.store.pipe(selectUnitToggle);
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.compare$
        .subscribe(compare => this.isProjectSelected = compare.findIndex(i => i.highlighted) >= 0)
    );

    this.loading$ = combineLatest(
      this.data$,
      this.compare$
    ).pipe(
      map(([data, compare]) => !isDataLoaded(data, compare, ['annual', 'monthly'])),
      tap(() => this.compareChanged$.next(false)),
      debounceTime(30),
      tap(() => this.compareChanged$.next(true)),
    );

    // table
    this.table$ = combineLatest([
      this.data$,
      this.compare$
    ]).pipe(
      filter(([data, compare]) => isDataLoaded(data, compare, ['annual', 'monthly'])),
      debounceTime(30),
      map(([data, compare]) => {
        const table: any = [];
        const rows = compare.map(item => data[item.energySystemId].monthly.data[this.layer.key]);

        let highlightIndex: number = compare.findIndex(i => i.highlighted);
        const hasDynamicColor: boolean = highlightIndex < 0;
        let percentDiff = {};

        months.forEach((month, i) => {
          let compareMonth: CompareMonth = Object.assign({}, rows && rows.map(row => row && row[i]));

          if (!this.isProjectSelected) {
            const compareMonthDataset = Object.values(compareMonth);
            const compareMonthDatasetNums = compareMonthDataset.map(value => typeof value === 'string' ? parseInt(value, 10) : value);
            highlightIndex = hasDynamicColor ? compareMonthDatasetNums.indexOf(Math.max(...compareMonthDatasetNums)) : -1;
          } else {
            const highlightValue = compareMonth[highlightIndex];
            const [percDiff, comparePeriod] = getLayersDiffs(compareMonth, highlightIndex, highlightValue, this.layer.key);
            percentDiff = percDiff;
            compareMonth = comparePeriod;
          }

          table.push({
            month,
            monthIndex: i,
            ...compareMonth,
            highlightIndex,
            roundedBadge: hasDynamicColor,
            percentDiff
          });
        });

        let compareYear: ComparePeriod = compare.map(item => data[item.energySystemId].annual.data[this.layer.key]);

        if (!this.isProjectSelected) {
          const compareYearDataset: number[] = Object.values(compareYear);
          highlightIndex = compareYearDataset.indexOf(Math.max(...compareYearDataset));
        } else {
          const highlightYearValue: number = compareYear[highlightIndex];
          const [percDiff, comparePeriod] = getLayersDiffs(compareYear, highlightIndex, highlightYearValue, this.layer.key);
          percentDiff = percDiff;
          compareYear = comparePeriod;
        }

        table.push({
          month: yearly,
          monthIndex: -1,
          ...compareYear,
          highlightIndex,
          roundedBadge: hasDynamicColor,
          percentDiff
        });

        return table;
      }),
    );

    this.columns$ = this.compare$.pipe(
      map(compare => (['month', ...strrange(compare.length)])),
    );

    // chart
    const unitsResolutions$: Observable<UnitResolution> = resolveUnit$(this.layer.unit, this.unitToggle$, this.transloco);

    const dataResolved$: Observable<CompareDataResolvedMap> = combineLatest(
      this.data$,
      this.compare$
    ).pipe(
      filter(([data, compare]) => isDataLoaded(data, compare, ['annual', 'monthly'])),
      switchMap(([data, compare]) => resolveCompareUnitValuesMap$(this.unitToggle$, compare, data, this.layer, ['monthly'])),
    );

    const chartData$ = combineLatest([dataResolved$, this.compare$]).pipe(
      map(([dataResolved, compare]) => {
        const selectedCompareItem = compare.filter(item => item.highlighted);
        const selectedCompareId = selectedCompareItem.length > 0 ? selectedCompareItem[0].energySystemId : null;
        const selectedDataItem = dataResolved[selectedCompareId];
        if (selectedCompareId) {
          return Object.entries(dataResolved).reduce((acc, [key, value]) => {
            const compareMonthlyData = Object.values(value).reduce((acc2, item: number[]) => {
              if (!item && this.layer.key === 'SNOWD') {
                item = new Array(12).fill(0);
              }
              const monthlyDataset = item?.map((monthlyItem, i) => {
                const { nominalDiff } = calculateDiffs(monthlyItem ? monthlyItem : 0,
                  selectedDataItem?.monthly ? selectedDataItem?.monthly[i] : 0);
                return nominalDiff;
              });
              acc2.monthly = monthlyDataset;
              return acc2;
            }, {} as DatasetData);
            acc[key] = compareMonthlyData;
            return acc;
          }, {});
        } else {return dataResolved;}
      }),
      map(data => {
        if (this.layer.key === 'SNOWD') {
          return Object.entries(data).reduce((acc, [key, value]) => {
            const monthlyData = Object.values(value).reduce((monthlyAcc, items: number[]) => {
              let monthlyDataSet = items?.map(item => item === null || item === -1 ? 0 : item);
              if (!items) {
                monthlyDataSet = new Array(12).fill(0);
              }
              monthlyAcc.monthly = monthlyDataSet;
              return monthlyAcc;
            }, {} as DatasetData);
            acc[key] = monthlyData;
            return acc;
          }, {});
        } else {return data;}
      }),
      tap(data => {
        if (this.isProjectSelected) {
          const monthlyDifferences = Object.values(data).map(item => {
            const monthlyDifference = Object.values(item).map(i => i);
            const concatedMonthlyDifference = [].concat(...monthlyDifference);
            return concatedMonthlyDifference;
          });
          const concatedMonthlyDifferences = [].concat(...monthlyDifferences);
          this.yMaxDynamic = Math.max(...concatedMonthlyDifferences);
          this.yMinDynamic = Math.min(...concatedMonthlyDifferences);
        }
      }),
    );

    this.chart$ = combineLatest(
      this.compare$,
      chartData$,
      monthsTranslated$(this.transloco),
      unitsResolutions$,
    ).pipe(
      debounceTime(30),
      map(([compare, data, monthsTranslated, unitResolution]) => {
        const series = compare.map(item => ({
          type: baseCompareChartType,
          name: this.projectNamePipe.transform(item.project),
          data: data && data[item.energySystemId].monthly,
          color: compareColors[item.colorIndex],
          unit: unitResolution.html
        } as SeriesOptions));
        return getCompareMonthlyChart(
          series,
          monthsTranslated,
          unitResolution.html,
          this.isProjectSelected ? this.yMaxDynamic : undefined,
          this.isProjectSelected ? this.yMinDynamic : this.layer.chart.min,
        );
      }),
    );
  }
}
