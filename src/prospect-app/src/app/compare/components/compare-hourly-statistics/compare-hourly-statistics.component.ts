import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Options, Series } from 'highcharts';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { DataLayer } from '@solargis/dataset-core';
import { resolveUnit$ } from '@solargis/ng-unit-value';
import { UnitResolution } from '@solargis/units';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { canvasWithFooterToDataURL } from 'ng-project/project/utils/export-chart.utils';
import { State } from 'ng-shared/core/reducers';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { downloadDataUrl } from 'ng-shared/shared/utils/download.utils';
import { months } from 'ng-shared/utils/translation.utils';

import { CompareDataMap } from '../../compare.types';
import { resolveCompareUnitValuesMap$ } from '../../utils/unit-value-compare.utils';
import { isDataLoaded } from '../compare-monthly-statistics/compare-monthly-statistics.component';
import { compareLegendChartOpts, getCompareHourlyCharts } from './compare-hourly-statistics.chart';

type MarkedCompareItem = { compareItem: CompareItem; target: Series };

@Component({
  selector: 'sg-compare-hourly-statistics',
  templateUrl: './compare-hourly-statistics.component.html',
  styleUrls: ['./compare-hourly-statistics.component.scss']
})
export class CompareHourlyStatisticsComponent implements OnInit {

  @Input() layer: DataLayer;
  @Input() compare$: Observable<CompareItem[]>;
  @Input() data$: Observable<CompareDataMap>;

  @Output() onClose = new EventEmitter<null>();

  @ViewChild('hourlyCharts') hourlyCharts: ElementRef;

  displayedCompare$: Observable<CompareItem[]>;
  markedCompareItems: MarkedCompareItem[] = [];
  charts$: Observable<Options[]>;
  legend$: Observable<Options>;
  loading$: Observable<boolean>;
  months = months;

  private readonly markEvent$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly transloco: TranslocoService,
    private readonly store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.loading$ = combineLatest(
      this.compare$,
      this.data$
    ).pipe(
      map(([compare, data]) => !isDataLoaded(data, compare, ['monthly-hourly'])),
    );

    this.displayedCompare$ =
      combineLatest([this.compare$, this.markEvent$]).pipe(
        map(([compare]) =>
          compare.filter(item => {
            if (!this.markedCompareItems.length) {return true;}
            const isItemVisible = this.markedCompareItems.some(markedItem =>
              markedItem.compareItem.energySystemId === item.energySystemId && markedItem.target.visible
            );
            return !isItemVisible;
          })
        )
      );

    const unitToggle$ = this.store.pipe(selectUnitToggle);

    const unitsResolutions$: Observable<UnitResolution> = resolveUnit$(this.layer.unit, unitToggle$, this.transloco);

    const dataResolved$ = combineLatest(
      this.displayedCompare$,
      this.data$
    ).pipe(
      filter(([compare, data]) => isDataLoaded(data, compare, ['monthly-hourly'])),
      filter(([, data]) => Object.keys(data).length > 0),
      switchMap(([compare, data]) => resolveCompareUnitValuesMap$(unitToggle$, compare, data, this.layer, ['monthly-hourly'])),
      distinctUntilChanged()
    );

    this.charts$ = combineLatest(
      this.displayedCompare$,
      dataResolved$,
      unitsResolutions$
    ).pipe(
      debounceTime(30),
      map(([compare, data, unitResolution]) => getCompareHourlyCharts(compare, data, unitResolution.html, this.projectNamePipe)),
      distinctUntilChanged(),
    );

    this.legend$ = this.compare$.pipe(
      map(compare => [compare, compare.map(item => this.projectNamePipe.transform(item.project))] as [CompareItem[], string[]]),
      distinctUntilChanged(),
      map(([compare, projectNames]) => compareLegendChartOpts(compare, projectNames, this.markChartDataset.bind(this)))
    );
  }

  markChartDataset(compareItem: CompareItem, target: Series): void {
    const itemIndex = this.markedCompareItems.findIndex(item => item.compareItem.energySystemId === compareItem.energySystemId);
    itemIndex === -1
      ? this.markedCompareItems.push({ compareItem, target })
      : this.markedCompareItems[itemIndex] = { compareItem, target };
    this.markEvent$.next(true);
  }

  exportCharts(): void {
    this.compare$.subscribe(compare => {
      import('html2canvas').then(
        module => module.default(this.hourlyCharts.nativeElement, {backgroundColor: 'white'})
      ).then(canvas => {
        const projectNames = compare.map(c => this.projectNamePipe.transform(c.project));
        const pvConfigs = compare.map(c => c.energySystem?.pvConfig);
        const timezones = compare.map(c => c.project.site.timezone);
        const img = canvasWithFooterToDataURL(canvas, this.layer, projectNames, pvConfigs, timezones);

        downloadDataUrl(img, `Solargis_Chart_Export_${this.layer.key}.png`);
      });
    });
  }
}

