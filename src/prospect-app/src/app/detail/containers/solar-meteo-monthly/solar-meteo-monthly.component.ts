import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, publishReplay, refCount, switchMap } from 'rxjs/operators';

import { DataLayer, Dataset } from '@solargis/dataset-core';
import { resolveUnit$, resolveUnitValuesMap$ } from '@solargis/ng-unit-value';
import { AnnualDataMap, combineDataArray, DataStatsMap, MonthlyDataMap } from '@solargis/types/dataset';
import { hasPvConfig as hasPvConfigFunction, Project } from '@solargis/types/project';
import { latlngToAzimuth } from '@solargis/types/site';
import { ensureArray } from '@solargis/types/utils';
import { Unit, UnitResolution, UnitToggleSettings } from '@solargis/units';

import {
  selectSelectedEnergySystem, selectSelectedEnergySystemProject, selectSelectedProjectAppData
} from 'ng-project/project-detail/selectors';
import { State } from 'ng-project/project/reducers';
import { EnergySystemWithProgress } from 'ng-project/project/reducers/energy-systems.reducer';
import { LTA_PVCALC_COMBINED_DATASET } from 'ng-project/project/services/combined-dataset.factory';
import { monthlyChartOpts } from 'ng-project/utils/chart.utils';
import { monthlyDataStats } from 'ng-project/utils/stats.utils';
import { SettingsToggles } from 'ng-shared/core/actions/settings.actions';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { ToggleDataUnitsDialogComponent } from 'ng-shared/shared/components/toggle-data-units-dialog/toggle-data-units-dialog.component';
import { selectProjectPermissions } from 'ng-shared/user/selectors/permissions.selectors';
import { months, monthsTranslated$, yearly } from 'ng-shared/utils/translation.utils';

import { ChartCardInput } from '../../components/chart-card/chart-card.component';
import {
  SolarMeteoTableSettingsDialogComponent
} from '../../dialogs/solar-meteo-table-settings-dialog/solar-meteo-table-settings-dialog.component';
import { SolarMeteoMonthlyDataSource } from './solar-meteo-monthly.data-source';

export const layers = [
  'GHI', 'DNI', 'DIF', 'D2G', 'GTI_opta',
  'TEMP', 'WS', 'RH', 'PREC', 'PWAT', 'SNOWD',
  'CDD', 'HDD', 'ALB'
]; // fixed keys

@Component({
  selector: 'sg-solar-meteo-monthly',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solar-meteo-monthly.component.html',
  styleUrls: ['./solar-meteo-monthly.component.scss']
})
export class SolarMeteoMonthlyComponent extends SubscriptionAutoCloseComponent implements OnInit {

  project$: Observable<Project>;

  monthlyData$: Observable<MonthlyDataMap>;
  monthlyDataAdjusted$: Observable<any>; // typing issues with MonthlyDataMap

  annualData$: Observable<AnnualDataMap>;
  optaAzimuth$: Observable<number>;

  energySystem$: Observable<EnergySystemWithProgress>;
  hasPvConfig$: Observable<boolean>;

  dataSource: SolarMeteoMonthlyDataSource;

  allColumns$: Observable<string[]>;
  dataColumns$: Observable<string[]>;
  glossaryLayers$: Observable<DataLayer[]>;

  charts$: Observable<ChartCardInput[]>;

  unitToggle$: Observable<UnitToggleSettings>;

  layers: string[]; // layer keys, actually

  constructor(
    private readonly store: Store<State>,
    private readonly transloco: TranslocoService,
    private readonly dialog: MatDialog,
    @Inject(LTA_PVCALC_COMBINED_DATASET) private readonly dataset: Dataset
  ) {
    super();
    this.unitToggle$ = this.store.pipe(selectUnitToggle);
  }

  ngOnInit(): void {
    this.project$ = this.store.pipe(selectSelectedEnergySystemProject);

    // combined lta and pvcalcDetails into single dataset
    const projectAppData$ = this.store.pipe(
      selectSelectedProjectAppData,
      map(({ lta, pvcalcDetails }) => combineDataArray(lta, pvcalcDetails)),
      publishReplay(),
      refCount()
    );

    this.energySystem$ = this.store.pipe(selectSelectedEnergySystem);
    this.hasPvConfig$ = this.energySystem$.pipe(map(s => hasPvConfigFunction(s as any)));

    const cards$: Observable<(DataLayer | DataLayer[])[][]> = this.hasPvConfig$.pipe(
      map(hasPvConfig => {
        const cards = [
          [
            [this.dataset.monthly.get('GHI'), this.dataset.monthly.get('DIF')],
            this.dataset.monthly.get('DNI')
          ],
          hasPvConfig // remove GTI_opta when PV config is not set
            ? [this.dataset.monthly.get('D2G')]
            : [this.dataset.monthly.get('GTI_opta'), this.dataset.monthly.get('D2G')],
          [
            this.dataset.monthly.get('TEMP'),
            this.dataset.monthly.get('WS'),
            this.dataset.monthly.get('CDD'),
            this.dataset.monthly.get('HDD'),
            this.dataset.monthly.get('ALB')
          ],
          [
            this.dataset.monthly.get('RH'),
            this.dataset.monthly.get('PREC'),
            this.dataset.monthly.get('PWAT'),
            this.dataset.monthly.get('SNOWD')
          ]
        ];
        return cards;
      })
    );

    this.monthlyData$ = projectAppData$.pipe(
      map(({ monthly }) => monthly && monthly.data),
      filter(monthlyData => !!monthlyData)
    );

    this.monthlyDataAdjusted$ = this.monthlyData$.pipe(
      switchMap(data => {
        const layerKeys = Object.keys(data);
        const monthlyLayers = layerKeys.map(key => this.layer(key, 'monthly'));
        return resolveUnitValuesMap$(this.unitToggle$, data, monthlyLayers);
      }),
      publishReplay(),
      refCount()
    );

    this.annualData$ = projectAppData$.pipe(
      map(({ annual }) => annual && annual.data),
      filter(annualData => !!annualData)
    );

    this.optaAzimuth$ = this.project$.pipe(
      map(project => latlngToAzimuth(project.site.point))
    );

    const layers$ = this.store.select('settings', 'selected', 'solarMeteoTable');

    this.addSubscription(layers$.subscribe(l => (this.layers = l)));

    this.dataSource = new SolarMeteoMonthlyDataSource(this.monthlyData$, this.annualData$, this.hasPvConfig$, layers$);

    this.dataColumns$ = this.dataSource.getColumns();
    this.allColumns$ = this.dataColumns$.pipe(map(columns => ['month', ...columns]));
    this.glossaryLayers$ = this.dataColumns$.pipe(map(keys => keys.map(key => this.layer(key))));

    const projectPermissions$ = this.project$.pipe(
      switchMap(project => this.store.pipe(selectProjectPermissions(project)))
    );

    const stats$ = this.monthlyDataAdjusted$.pipe(map(data => monthlyDataStats(data, this.dataset.monthly)));

    this.charts$ = combineLatest(cards$, projectPermissions$, stats$).pipe(
      map(([cards, permissions, stats]) =>
        cards.map(card =>
          card.map(cardLayers => ({
            layers: cardLayers,
            chart: this.monthlyChartOpts$(cardLayers, stats),
            hasPermission: this.hasPermission(cardLayers, permissions)
          }))
        )
      )
    );
  }

  hasPermission(layersArg: DataLayer | DataLayer[], permissions: string[]): boolean {
    return ensureArray(layersArg)
      .map(l => !!permissions.find(p => p === l.access))
      .every(Boolean);
  }

  monthlyChartOpts$(layersArg: DataLayer | DataLayer[], stats: DataStatsMap): Observable<Highcharts.Options> {
    const monthlyLayers = ensureArray(layersArg);

    const unitsResolutions$: Observable<UnitResolution>[] = monthlyLayers.map(layer =>
      resolveUnit$(layer.unit, this.unitToggle$, this.transloco)
    );

    return combineLatest(
      ...[this.monthlyDataAdjusted$, monthsTranslated$(this.transloco), ...unitsResolutions$]
    ).pipe(
      map(([data, monthsTranslated, ...unitResolutions]) => {
        const [unitLabelsMap, unitFormatterMap] = monthlyLayers.reduce(
          ([labelsMap, formatters], layer, i) => [
            {
              ...labelsMap,
              [layer.key]: (unitResolutions[i] as UnitResolution).html
            },
            {
              ...formatters,
              [layer.key]: (unitResolutions[i] as UnitResolution).formatter()
            }
          ],
          [{}, {}]
        );
        const formatter = (val: number, key: string): any =>
          unitFormatterMap[key](val);
        return monthlyChartOpts(
          monthsTranslated,
          monthlyLayers,
          data,
          unitLabelsMap,
          formatter,
          {
            min: monthlyLayers[0].chart.min,
            max:
              monthlyLayers[0].chart.max ||
              (stats[monthlyLayers[0].key] && stats[monthlyLayers[0].key].max)
          },
          false
        );
      })
    );
  }

  layer(key: string, resolution: 'annual' | 'monthly' = 'annual'): DataLayer {
    return this.dataset[resolution].get(key);
  }

  unit(key: string, monthIndex?: number): Unit {
    const resolution = typeof monthIndex === 'undefined' ? 'annual' : 'monthly';
    return this.layer(key, resolution).unit;
  }

  monthTranslationKey(monthIndex: number | undefined): string {
    // 0-based index
    return typeof monthIndex !== 'undefined' ? months[monthIndex] : yearly;
  }

  openTableSettings(): void {
    const data = {
      layerList: layers,
      selectedLayers: this.layers
    };
    this.dialog.open(SolarMeteoTableSettingsDialogComponent, { data });
  }

  openUnitSettings(): void {
    const dialog = this.dialog.open(ToggleDataUnitsDialogComponent, {});

    dialog
      .afterClosed()
      .pipe(first())
      .subscribe(
        result => result && this.store.dispatch(new SettingsToggles(result))
      );
  }
}
