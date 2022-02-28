import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Options } from 'highcharts';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, publishReplay, refCount, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { DataLayer, DataLayerMap, Dataset, filterDataset } from '@solargis/dataset-core';
import { resolveUnit$, resolveUnitValuesMap$ } from '@solargis/ng-unit-value';
import {
  addEmptyRowsAndCapacityFactor,
  calculateEconomyStats,
  computePvLifetimePerformance,
  computePvLosses,
  economyCalculator,
  EconomyCalculatorOutput,
  getEconomyCalculatorDefaults,
  PvLifetimePerformance,
  PvLossDiagramRow,
  PvLossTableRow
} from '@solargis/prospect-detail-calc';
import {
  AnnualDataMap, combineDataArray, DataStats, DataStatsMap, MonthlyDataMap, MonthlyHourlyData, VersionedDatasetData
} from '@solargis/types/dataset';
import { EconomyInput } from '@solargis/types/economy';
import { MapLayerDef } from '@solargis/types/map';
import { EnergySystem, hasPvConfig as hasPvConfigFunction, Project } from '@solargis/types/project';
import { NoPvSystem, PvConfig, SystemPvConfig } from '@solargis/types/pv-config';
import { SystemConfig } from '@solargis/types/pvlib';
import { latlngToAzimuth } from '@solargis/types/site';
import { Company } from '@solargis/types/user-company';
import { ensureArray, isEmpty, range } from '@solargis/types/utils';
import { UnitResolution } from '@solargis/units';
import { Unit, UnitToggleSettings } from '@solargis/units';


import {
  selectSelectedEnergySystem,
  selectSelectedEnergySystemData,
  selectSelectedEnergySystemProject,
  selectSelectedProjectAppData
} from 'ng-project/project-detail/selectors';
import { State } from 'ng-project/project/reducers';
import { EnergySystemWithProgress } from 'ng-project/project/reducers/energy-systems.reducer';
import { LTA_PVCALC_COMBINED_DATASET } from 'ng-project/project/services/combined-dataset.factory';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { mapDatasetData } from 'ng-project/project/utils/map-dataset-data.operator';
import { mapPvConfigStatus } from 'ng-project/project/utils/map-pv-config-status.operator';
import { isFreetrialProject } from 'ng-project/project/utils/project-freetrial.utils';
import { hourlyChartOpts, legendChartOpts, monthlyChartOpts } from 'ng-project/utils/chart.utils';
import { satelliteMapLayerId } from 'ng-project/utils/map.constants';
import { getDataStats, monthlyDataStats } from 'ng-project/utils/stats.utils';
import { ProspectAppConfig } from 'ng-shared/config';
import { LayoutDrawerStateUpdate } from 'ng-shared/core/actions/layout.actions';
import { SettingsTranslateLang } from 'ng-shared/core/actions/settings.actions';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectActiveOrNoCompany, selectIsFreetrialActive } from 'ng-shared/user/selectors/company.selectors';
import { selectProjectPermissions } from 'ng-shared/user/selectors/permissions.selectors';
import { months, monthsTranslated$ } from 'ng-shared/utils/translation.utils';

import { ChartCardInput } from '../../../detail/components/chart-card/chart-card.component';
import { solarMeteoHourlyCharts } from '../../../detail/containers/solar-meteo-hourly/solar-meteo-hourly.charts';
import { SolarMeteoMonthlyDataSource } from '../../../detail/containers/solar-meteo-monthly/solar-meteo-monthly.data-source';
import { HorizonService } from '../../../detail/services/horizon.service';
import { PvElectricityMonthlyDailyDataSource } from './pv-electricity-monthly-daily.data-source';

const layers = [
  'GHI', 'DNI', 'DIF', 'D2G', 'GTI_opta',
  'TEMP', 'WS', 'RH', 'PREC', 'PWAT', 'SNOWD',
  'CDD', 'HDD', 'ALB'
]; // fixed keys

const layers$ = of(layers);

@Component({
  templateUrl: './project-report.component.html',
  styleUrls: ['./project-report.component.scss']
})
export class ProjectReportComponent extends SubscriptionAutoCloseComponent implements OnInit {

  hasLtaAllPermission$: Observable<boolean>;

  project: Project;
  layerDef: MapLayerDef;
  horizon$: Observable<[number, number][]>;
  pvConfig$: Observable<PvConfig>;

  monthlyData$: Observable<MonthlyDataMap>;
  monthlyDataAdjusted$: Observable<any>; // typing issues with MonthlyDataMap

  annualData$: Observable<AnnualDataMap>;
  optaAzimuth$: Observable<number>;

  energySystem$: Observable<EnergySystemWithProgress>;
  hasPvConfig$: Observable<boolean>;

  solarMeteoMonthlyDataSource: SolarMeteoMonthlyDataSource;
  pvElectricityMonthlyDataSource: PvElectricityMonthlyDailyDataSource;

  solarColumns$: Observable<string[]>;
  meteoColumns$: Observable<string[]>;
  dataColumns$: Observable<string[]>;
  optaUnit: Unit;

  solarMeteoHourlyCharts$: Observable<{ series: any[]; legend: Options; layers: DataLayer[] }>;
  solarMeteoHourlyHeatmaps$: Observable<{ data: MonthlyHourlyData; stats: DataStats; layer: DataLayer }[]>;

  pvElectricityDataColumns: string[];
  pvElectricityColumns: string[];

  charts$: Observable<ChartCardInput[]>;

  unitToggle$: Observable<UnitToggleSettings>;

  pvcalcData$: Observable<VersionedDatasetData>;

  pvElectricityLayers = ['PVOUT_specific', 'GTI', 'PR'];
  pvElectricityCharts$: Observable<Options>[];

  hourlyProfiles$: Observable<any>;

  annualPvCalcData$: Observable<AnnualDataMap>;
  lossesTable$: Observable<PvLossTableRow[]>;
  lossesDiagram$: Observable<PvLossDiagramRow[]>;

  annualLayers: DataLayerMap;
  gtiLayer: DataLayer;
  pvoutSpecificLayer: DataLayer;

  performanceTable$: Observable<PvLifetimePerformance[]>;

  systemConfig$: Observable<SystemConfig>;
  economyInputs$: Observable<EconomyInput>;
  economy$: Observable<EconomyCalculatorOutput>;
  economyStats$: Observable<{ [key: string]: number }>;

  currentYear: number;
  today: Date;
  months = months;
  includeEconomy: boolean;

  selectedCompany$: Observable<Company>;
  glossaryLayers$: Observable<DataLayer[]>;
  freeTrial$: Observable<boolean>;

  constructor(
    private readonly store: Store<State>,
    private readonly config: ProspectAppConfig,
    private readonly horizonService: HorizonService,
    private readonly transloco: TranslocoService,
    private readonly datasetService: DatasetAccessService,
    private readonly activatedRoute: ActivatedRoute,
    @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset,
    @Inject(LTA_PVCALC_COMBINED_DATASET) public dataset: Dataset
  ) {
    super();
    this.unitToggle$ = this.store.pipe(selectUnitToggle);
    this.currentYear = new Date().getFullYear();
    this.today = new Date();

    this.annualLayers = pvcalcDataset.annual;
    this.gtiLayer = this.annualLayers.get('GTI');
    this.pvoutSpecificLayer = this.annualLayers.get('PVOUT_specific');
  }

  ngOnInit(): void {
    // because of canvases devicePixelRation has to be changed here
    (window as any).devicePixelRatio = 3;

    this.store.dispatch(new LayoutDrawerStateUpdate({ toggle: 'closed' }));

    const project$ = this.store
      .pipe(selectSelectedEnergySystemProject)
      .pipe(distinctUntilChanged((prev, curr) => prev._id === curr._id));

    this.freeTrial$ = combineLatest([project$, this.store.pipe(selectIsFreetrialActive)]).pipe(
      map(([project, freetrialActive]) => freetrialActive && isFreetrialProject(project))
    );

    const projectPermissions$ = project$.pipe(
      switchMap(project => this.store.pipe(selectProjectPermissions(project)))
    );

    this.hasLtaAllPermission$ = projectPermissions$.pipe(
      map(perms => perms.includes('prospect:lta:all'))
    );

    this.addSubscription(project$.subscribe(project => (this.project = project)));

    this.layerDef = this.config.map.layers.find(elem => elem._id === satelliteMapLayerId);

    this.selectedCompany$ = this.store.pipe(selectActiveOrNoCompany);

    this.horizon$ = project$.pipe(
      switchMap((project: any) => this.horizonService.getHorizon(project)),
      startWith(undefined),
      shareReplay()
    );

    this.pvConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => (system && system.pvConfig) || NoPvSystem)
    );

    // combined lta and pvcalcDetails into single dataset
    const projectAppData$ = this.store.pipe(
      selectSelectedProjectAppData,
      map(({ lta, pvcalcDetails }) => combineDataArray(lta, pvcalcDetails)),
      publishReplay(),
      refCount()
    );

    this.energySystem$ = this.store.pipe(selectSelectedEnergySystem);
    this.hasPvConfig$ = this.energySystem$.pipe(map(es => hasPvConfigFunction(es as any)));

    const cards$: Observable<(DataLayer | DataLayer[])[][]> = this.hasPvConfig$.pipe(
      map(hasPvConfig => {
        const cards = [
          [[this.dataset.monthly.get('GHI'), this.dataset.monthly.get('DIF')]],
          [this.dataset.monthly.get('DNI')],
          [this.dataset.monthly.get('D2G')],
          [this.dataset.monthly.get('TEMP')],
          [this.dataset.monthly.get('ALB')],
          [this.dataset.monthly.get('WS')],
          [this.dataset.monthly.get('RH')],
          [this.dataset.monthly.get('PREC')],
          [this.dataset.monthly.get('PWAT')],
          [this.dataset.monthly.get('SNOWD')],
          [this.dataset.monthly.get('CDD')],
          [this.dataset.monthly.get('HDD')]
        ];
        if (!hasPvConfig) {
          cards.splice(3, 0, [this.dataset.monthly.get('GTI_opta')]);
        }
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

    this.optaAzimuth$ = project$.pipe(
      map(project => latlngToAzimuth(project.site.point))
    );

    this.solarMeteoMonthlyDataSource = new SolarMeteoMonthlyDataSource(this.monthlyData$, this.annualData$, this.hasPvConfig$, layers$);

    this.dataColumns$ = this.solarMeteoMonthlyDataSource.getColumns();
    const solarColumns = ['GHI', 'DNI', 'DIF', 'D2G', 'GTI_opta', 'TEMP', 'WS', 'CDD', 'HDD'];
    this.solarColumns$ = this.dataColumns$.pipe(
      map(columns => ['month', ...columns.filter(c => solarColumns.indexOf(c) >= 0)])
    );
    this.meteoColumns$ = this.dataColumns$.pipe(
      map(columns => ['month', ...columns.filter(c => solarColumns.indexOf(c) < 0)])
    );

    this.optaUnit = this.dataset.annual.get('OPTA').unit;

    const stats$ = this.monthlyDataAdjusted$.pipe(
      map(data => monthlyDataStats(data, this.dataset.monthly))
    );

    this.charts$ = combineLatest([cards$, projectPermissions$, stats$]).pipe(
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

    const pvcalcDetailsData$ = this.store.pipe(
      selectSelectedProjectAppData,
      map(data => data && data.pvcalcDetails),
      distinctUntilChanged()
    );

    const pvcalcData$ = this.store.pipe(
      selectSelectedEnergySystemData,
      map(data => data && data.pvcalc),
      distinctUntilChanged()
    );

    this.pvcalcData$ = combineLatest([pvcalcDetailsData$, pvcalcData$]).pipe(
      map(([pvcalcDetails, pvcalc]) => combineDataArray(pvcalcDetails, pvcalc)),
      map(data => {
        // remove GTI_opta && GTI_theoretical if GTI is present
        const GTI = data && data.annual && data.annual.data.GTI;
        return typeof GTI !== 'undefined'
          ? filterDataset(this.pvcalcDataset, data, { keys: ['!GTI_opta', '!GTI_theoretical'] })
          : data;
      })
    );

    this.pvElectricityMonthlyDataSource = new PvElectricityMonthlyDailyDataSource(
      pvcalcData$.pipe(publishReplay(), refCount())
    );

    this.pvElectricityDataColumns = this.pvElectricityMonthlyDataSource.getColumns();
    this.pvElectricityColumns = ['month'].concat(this.pvElectricityDataColumns);

    const months$ = monthsTranslated$(this.transloco);
    const unitToggle$ = this.store.pipe(selectUnitToggle);

    const pvcalcLayers = this.pvElectricityLayers.map(key => this.pvcalcDataset.monthly.get(key));

    const monthly$ = pvcalcData$.pipe(
      filter(pvcalc => pvcalc && !!pvcalc.monthly),
      map(pvcalc => pvcalc.monthly.data),
      switchMap(monthlyData => resolveUnitValuesMap$(unitToggle$, monthlyData, pvcalcLayers)),
      distinctUntilChanged()
    );

    const solarMeteoHourlyKeys = ['GHI', 'DIF', 'DNI'];
    const solarMeteoHourlyLayers = solarMeteoHourlyKeys.map(key => this.pvcalcDataset['monthly-hourly'].get(key));
    const solarMeteoHourlyunitResolutions$: Observable<UnitResolution>[] = solarMeteoHourlyKeys.map(key =>
      resolveUnit$(this.pvcalcDataset['monthly-hourly'].get(key).unit, unitToggle$, this.transloco));
    const solarMeteoHourlyData$ = this.store.pipe(
      selectSelectedProjectAppData,
      mapDatasetData('pvcalcDetails', 'monthly-hourly')
    );

    this.solarMeteoHourlyCharts$ = combineLatest([
      solarMeteoHourlyData$.pipe(switchMap(data => resolveUnitValuesMap$(unitToggle$, data, solarMeteoHourlyLayers))),
      ...solarMeteoHourlyunitResolutions$
    ]).pipe(
      filter(([data]) => !isEmpty(data)),
      map(([data, ...unitResolutions]) => {
        const [unitLabelsMap, unitFormatterMap] = solarMeteoHourlyKeys.reduce(
          ([ul, tk], key, i) => [
            { ...ul, [key]: (unitResolutions[i] as UnitResolution).html },
            { ...tk, [key]: (unitResolutions[i] as UnitResolution).formatter() }
          ],
          [{}, {}]
        );

        const formatter = (val: number, key: string): any => unitFormatterMap[key](val);
        const stats = getDataStats(data);

        const charts = solarMeteoHourlyCharts(solarMeteoHourlyLayers, data, stats, unitLabelsMap, formatter);
        charts.series.map(serie => {
          serie.xAxis = { ...serie.xAxis, ...{ labels: { step: 6 } } };
        });
        return charts;
      })
    );

    const solarMeteoHourlyHeatmapKeys = ['GHI', 'DNI'];
    this.solarMeteoHourlyHeatmaps$ = solarMeteoHourlyData$.pipe(
      filter(data => !isEmpty(data)),
      map(data => {
        const stats = getDataStats(data);
        const getLayer = (key): DataLayer => this.pvcalcDataset['monthly-hourly'].get(key);
        return solarMeteoHourlyHeatmapKeys.map(key => ({
          data: data[key],
          stats: stats[key],
          layer: getLayer(key)
        }));
      })
    );

    const unitResolution$ = (layerKey: string): Observable<UnitResolution> =>
      resolveUnit$(pvcalcLayers[this.pvElectricityLayers.indexOf(layerKey)].unit, unitToggle$, this.transloco);

    this.pvElectricityCharts$ = this.pvElectricityLayers.map(l => combineLatest([monthly$, months$, unitResolution$(l)]).pipe(
        map(([data, monthsTranslated, unitResolution]) => {
          const opts = monthlyChartOpts(
            monthsTranslated,
            pvcalcLayers[this.pvElectricityLayers.indexOf(l)],
            data,
            unitResolution.html,
            unitResolution.formatter()
          );
          opts.chart.marginLeft = 40;
          opts.chart.marginRight = 5;
          return opts;
        })
      ));

    const hourlyProfilesKey = 'PVOUT_specific';

    const pvData$ = this.store.pipe(
      selectSelectedEnergySystemData,
      mapDatasetData('pvcalc', 'monthly-hourly'),
      filter(pvcalc => !!pvcalc)
    );

    const pvDataAdj$ = pvData$.pipe(
      switchMap(data => {
        const layer = this.pvcalcDataset['monthly-hourly'].get(hourlyProfilesKey);
        return resolveUnitValuesMap$(unitToggle$, data, [layer]);
      })
    );

    const unitResolutionHourly$ = resolveUnit$(
      this.pvcalcDataset['monthly-hourly'].get(hourlyProfilesKey).unit, unitToggle$, this.transloco
    );

    this.hourlyProfiles$ = combineLatest([pvData$, pvDataAdj$, unitResolutionHourly$]).pipe(
      map(([pvcalcData, pvcalcDataAdj, unitResolution]) => {
        const pvcalcStats = getDataStats(pvcalcData, [hourlyProfilesKey]);

        const [unitLabelsMap, unitFormatterMap] = [hourlyProfilesKey].reduce(
          ([ul, tk], key) => [
            { ...ul, [key]: unitResolution.html },
            { ...tk, [key]: (unitResolution as any).formatter() }
          ],
          [{}, {}]
        );

        const formatter = (val: number, key: string): any => unitFormatterMap[key](val);

        const layer = this.pvcalcDataset['monthly-hourly'].get(hourlyProfilesKey);

        const charts = range(12).map(i => {
          const opts = hourlyChartOpts(
            [layer],
            [pvcalcDataAdj[layer.key][i]],
            pvcalcStats[layer.key],
            unitLabelsMap,
            formatter
          );
          opts.xAxis = { ...opts.xAxis, ...{ labels: { step: 6 } } };
          return opts;
        });

        return {
          keys: [layer.key],
          heatmap: {
            layer,
            stats: pvcalcStats[layer.key],
            data: pvcalcData[layer.key]
          },
          legend: legendChartOpts([layer], unitLabelsMap),
          charts
        };
      })
    );

    this.annualPvCalcData$ = this.store.pipe(
      selectSelectedEnergySystemData,
      mapDatasetData('pvcalc', 'annual')
    );

    const losses$ = this.store.pipe(
      selectSelectedEnergySystemData,
      map(data => data && data.pvcalc),
      map(pvcalcData => computePvLosses(pvcalcData)),
      publishReplay(1),
      refCount()
    );

    this.lossesTable$ = losses$.pipe(map(rows => addEmptyRowsAndCapacityFactor(rows)));
    this.lossesDiagram$ = losses$.pipe(
      map(rows => rows && rows.filter(row => row.group === 'gti' || row.group === 'pv')),
      map(rows => rows && rows.map(row => ({
        ...row,
        energyFirstRow: rows[0].energy,
        prLastRow: rows[rows.length - 1].pr
      })))
    );

    const pvConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system && system.pvConfig)
    ) as Observable<SystemPvConfig>;

    this.performanceTable$ = combineLatest([
      this.annualPvCalcData$,
      pvConfig$
    ]).pipe(
      map(([pvCalcAnnual, pvConfig]) => pvConfig && pvConfig.type !== 'noPvSystem'
        ? computePvLifetimePerformance(pvCalcAnnual, pvConfig)
        : null
      )
    );

    const ltaPvcalcDataset$ = this.datasetService.datasetWithAccess$(this.dataset, project$, true);
    const ltaPvcalcAnnualLayers$ = ltaPvcalcDataset$.pipe(map(dataset => dataset.annual));

    const gtiTheoreticalLayer = this.pvcalcDataset.annual.filterLayers(({ key }) => key === 'GTI_theoretical');
    const gtiTheoreticalLayer$ = this.datasetService.dataLayersWithAccess$(gtiTheoreticalLayer, project$, true);

    const pvConfigStatus$ = this.store.pipe(selectSelectedEnergySystem, mapPvConfigStatus());

    const solarGlossaryLayers$ = combineLatest([
      ltaPvcalcAnnualLayers$.pipe(map(ltaLayers => ltaLayers.filterLayers(({ group }) => group === 'solar'))),
      gtiTheoreticalLayer$,
      pvConfigStatus$
    ]).pipe(
      // filter out GTI_opta and OPTA if PV config is set
      map(([solarLayers, gtiTheoretical, pvConfigStatus]) => {
        if (pvConfigStatus === 'hasPvSystem') {
          return [solarLayers.filterLayers(({ key }) => !['GTI_opta', 'OPTA'].includes(key)), gtiTheoretical];
        } else {
          return [solarLayers, gtiTheoretical];
        }
      }),
      map(([solar, gtiTheoretical]) => solar.toArray().concat(gtiTheoretical.toArray()))
    );

    const meteoGlossaryLayers$ = ltaPvcalcAnnualLayers$.pipe(
      map(meteoLayers => meteoLayers.filterLayers(layer => layer.group === 'weather')),
      map(res => res.toArray())
    );

    const glossaryPvcalcLayers = this.pvcalcDataset.annual.filterLayers(
      ({ key }) => ['GTI', 'PVOUT_specific', 'PVOUT_total', 'PR'].includes(key)
    );
    const pvcalcLayers$ = this.datasetService.dataLayersWithAccess$(glossaryPvcalcLayers, project$, true);

    const pvPerformanceLayers = this.pvcalcDataset.annual.filterLayers(
      ({ key }) => ['PVOUT_specific', 'PVOUT_total', 'PR', 'CF'].includes(key)
    );
    const pvPerformanceLayers$ = this.datasetService.dataLayersWithAccess$(pvPerformanceLayers, project$, true);

    const pvGlossaryLayers$ = combineLatest([
      pvcalcLayers$,
      pvPerformanceLayers$,
      pvConfigStatus$
    ]).pipe(
      map(([pvcalc, pvperformance, pvConfigStatus]) => {
        if (pvConfigStatus === 'hasPvSystem') {
          const res = pvcalc.toArray();
          res.push(pvperformance.get('CF'));
          return res;
        }
        return [];
      })
    );

    this.glossaryLayers$ = combineLatest([solarGlossaryLayers$, meteoGlossaryLayers$, pvGlossaryLayers$]).pipe(
      map(glossaryLayers => glossaryLayers.reduce((a, b) => [...a, ...b]))
    );

    this.systemConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system && system.pvRequest)
    );

    this.economyInputs$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system && (system.economy || getEconomyCalculatorDefaults(system as EnergySystem)))
    );

    this.economy$ = combineLatest([this.economyInputs$, this.annualPvCalcData$, this.systemConfig$]).pipe(
      map(([inputs, pvout, systemConfig]) =>
        inputs && pvout && systemConfig
          ? economyCalculator(inputs, pvout, systemConfig)
          : null
      ),
      publishReplay(),
      refCount()
    );

    this.economyStats$ = this.economy$.pipe(
      map(economy => calculateEconomyStats(economy)),
      publishReplay(),
      refCount()
    );

    const queryParams = this.activatedRoute.snapshot.queryParams;
    const queryLang = queryParams.lang;
    this.includeEconomy = queryParams.economy === 'true';

    if (queryLang) {
      setTimeout(() => this.store.dispatch(new SettingsTranslateLang(queryLang, false)));
    }
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
            { ...labelsMap, [layer.key]: (unitResolutions[i] as UnitResolution).html },
            { ...formatters, [layer.key]: (unitResolutions[i] as UnitResolution).formatter() }
          ],
          [{}, {}]
        );
        const formatter = (val: number, key: string): any => unitFormatterMap[key](val);
        const opts = monthlyChartOpts(
          monthsTranslated,
          monthlyLayers,
          data,
          unitLabelsMap,
          formatter,
          {
            min: monthlyLayers[0].chart.min,
            max: monthlyLayers[0].chart.max || (stats[monthlyLayers[0].key] && stats[monthlyLayers[0].key].max)
          },
          false
        );
        opts.chart.marginLeft = 40;
        opts.chart.marginRight = 5;
        return opts;
      })
    );
  }

  layer(key: string, resolution: 'annual' | 'monthly' = 'annual'): DataLayer {
    return this.dataset[resolution].get(key);
  }

  isLayerArray(value: DataLayer | DataLayer[]): boolean {
    return Array.isArray(value);
  }

  capitalized = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  selectedAnnualKeys = (hasPvConfig: boolean): string[] => hasPvConfig
    ? ['PVOUT_specific', 'PVOUT_total', 'GTI', 'PR', 'GHI', 'DNI', 'DIF', 'TEMP']
    : ['GHI', 'DNI', 'DIF', 'TEMP'];
}
