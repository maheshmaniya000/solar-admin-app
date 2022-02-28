import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Options } from 'highcharts';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, first, map, publishReplay, refCount } from 'rxjs/operators';

import { DataLayer, DataLayerMap, Dataset, toggleUnitValuesMap } from '@solargis/dataset-core';
import { UnitToggleService } from '@solargis/ng-unit-value';
import { computeAveragePvPerformance, PvAveragePerformance } from '@solargis/prospect-detail-calc';
import { AnnualDataMap, combineDataArray, DataStatsMap, MonthlyDataMap, VersionedDatasetData } from '@solargis/types/dataset';
import { Project } from '@solargis/types/project';
import { NoPvSystem, PvConfig, PvConfigStatus, SystemPvConfig } from '@solargis/types/pv-config';
import { isEmptyField } from '@solargis/types/utils';
import { latlngUnit } from '@solargis/units';

import { MapCenter } from 'ng-project/map/map.actions';
import {
  selectSelectedEnergySystem,
  selectSelectedEnergySystemData,
  selectSelectedEnergySystemMetadataLatest,
  selectSelectedEnergySystemProject,
  selectSelectedProjectAppData
} from 'ng-project/project-detail/selectors';
import { getProjectDefaultEnergySystemRef } from 'ng-project/project-list/utils/project.utils';
import { ProjectShareDialogComponent } from 'ng-project/project/dialogs/project-share-dialog/project-share-dialog.component';
import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { LTA_PVCALC_COMBINED_DATASET } from 'ng-project/project/services/combined-dataset.factory';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { ExportChartOpts } from 'ng-project/project/types/export-chart.types';
import { exportChartOptsOperator } from 'ng-project/project/utils/export-chart-opts.operator';
import { mapPvConfigStatus } from 'ng-project/project/utils/map-pv-config-status.operator';
import { monthlyDataStats } from 'ng-project/utils/stats.utils';
import { OpenUpdateProjectDataDialog } from 'ng-shared/core/actions/dialog.actions';

import { overviewMonthlyChartOpts } from './prospect-overview.charts';

const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

type OverviewTileDef = {
  datasetType: 'solarMeteo' | 'pvcalc';
  layerKey: string;
};

type OverviewTileOpts = OverviewTileDef & {
  annualLayer: DataLayer;
  annualData: AnnualDataMap;
  monthlyChart: Options;
};

const pvTileDefs: OverviewTileDef[] = [
  { datasetType: 'pvcalc', layerKey: 'GTI' },
  { datasetType: 'solarMeteo', layerKey: 'TEMP' },
  { datasetType: 'pvcalc', layerKey: 'PVOUT_specific' },
  { datasetType: 'pvcalc', layerKey: 'PR' }
];

const noPvTileDefs: OverviewTileDef[] = [
  { datasetType: 'solarMeteo', layerKey: 'GHI' },
  { datasetType: 'solarMeteo', layerKey: 'DNI' },
  { datasetType: 'solarMeteo', layerKey: 'DIF' },
  { datasetType: 'solarMeteo', layerKey: 'TEMP' }
];

const overviewChartHeight = 150;

function getMonthlyData(data: VersionedDatasetData): MonthlyDataMap {
  return data?.monthly?.data as MonthlyDataMap;
}

function getAnnualData(data: VersionedDatasetData): AnnualDataMap {
  return data?.annual?.data as AnnualDataMap;
}

@Component({
  selector: 'sg-prospect-overview',
  templateUrl: './prospect-overview.component.html',
  styleUrls: ['./prospect-overview.component.scss']
})
export class ProspectOverviewComponent implements OnInit {
  latlngUnit = latlngUnit;

  glossaryLayers$: Observable<DataLayer[]>;

  project$: Observable<Project>;

  pvConfig$: Observable<PvConfig>;
  pvConfigStatus$: Observable<PvConfigStatus>;

  ltaPvcalcDataset$: Observable<Dataset>;

  solarMeteoData$: Observable<VersionedDatasetData>;
  solarMeteoMonthlyDataStats$: Observable<DataStatsMap>;

  pvcalcData$: Observable<VersionedDatasetData>;
  pvcalcAnnualData$: Observable<AnnualDataMap>;
  pvcalcMonthlyDataStats$: Observable<DataStatsMap>;

  overviewTiles$: Observable<OverviewTileOpts[]>;

  solarLayers$: Observable<DataLayerMap>;
  weatherLayers$: Observable<DataLayerMap>;
  pvcalcLayers$: Observable<DataLayerMap>;

  pvPerformanceLayers$: Observable<DataLayerMap>;
  pvPerformanceData$: Observable<PvAveragePerformance>;

  updateDataButtonVisible$: Observable<boolean>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly store: Store<State>,
    private readonly datasetService: DatasetAccessService,
    private readonly unitToggleService: UnitToggleService,
    private readonly projectNamePipe: ProjectNamePipe,
    @Inject(PVCALC_DATASET) private readonly pvcalcDataset: Dataset,
    @Inject(LTA_PVCALC_COMBINED_DATASET) private readonly ltaPvcalcDataset: Dataset
  ) { }

  ngOnInit(): void {
    this.project$ = this.store.pipe(selectSelectedEnergySystemProject);

    this.pvConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system ? system.pvConfig : NoPvSystem)
    );
    this.pvConfigStatus$ = this.store.pipe(selectSelectedEnergySystem, mapPvConfigStatus());

    this.ltaPvcalcDataset$ = this.datasetService.datasetWithAccess$(this.ltaPvcalcDataset, this.project$, true);

    const ltaPvcalcAnnualLayers$ = this.ltaPvcalcDataset$.pipe(map(dataset => dataset.annual));

    const projectAppData$ = this.store.pipe(selectSelectedProjectAppData);
    const energySystemData$ = this.store.pipe(selectSelectedEnergySystemData);

    this.solarMeteoData$ = projectAppData$.pipe(
      filter(x => !!x),
      map(({ lta, pvcalcDetails}) => combineDataArray(lta, pvcalcDetails)),
      publishReplay(),
      refCount()
    );

    this.updateDataButtonVisible$ = this.store.select(selectSelectedEnergySystemMetadataLatest('prospect'))
      .pipe(map(latest => !latest));

    this.solarMeteoMonthlyDataStats$ = this.solarMeteoData$.pipe(
      map(solarMeteo => solarMeteo && solarMeteo.monthly && solarMeteo.monthly.data),
      map(monthlyData => monthlyDataStats(monthlyData, this.ltaPvcalcDataset.monthly))
    );

    this.solarLayers$ = combineLatest(
      ltaPvcalcAnnualLayers$.pipe(
        map(layers => layers.filterLayers(({ group }) => group === 'solar'))
      ),
      this.pvConfigStatus$
    ).pipe(
      // filter out GTI_opta and OPTA if PV config is set
      map(([solarLayers, pvConfigStatus]) => {
        if (pvConfigStatus === 'hasPvSystem') {
          return solarLayers.filterLayers(({ key }) => !['GTI_opta', 'OPTA'].includes(key));
        } else {
          return solarLayers;
        }
      })
    );

    this.weatherLayers$ = ltaPvcalcAnnualLayers$.pipe(
      map(layers => layers.filterLayers(layer => layer.group === 'weather'))
    );

    // PV DATA INIT
    const pvcalcLayers = this.pvcalcDataset.annual.filterLayers(
      ({ key }) => ['GTI_theoretical', 'GTI', 'PVOUT_specific', 'PVOUT_total', 'PR'].includes(key)
    );

    this.pvcalcLayers$ = this.datasetService.dataLayersWithAccess$(pvcalcLayers, this.project$, true);

    this.pvcalcData$ = energySystemData$.pipe(map(data => data && data.pvcalc));
    this.pvcalcAnnualData$ = this.pvcalcData$.pipe(map(getAnnualData));

    this.pvcalcMonthlyDataStats$ = this.pvcalcData$.pipe(
      map(getMonthlyData),
      map(monthlyData => monthlyDataStats(monthlyData, this.pvcalcDataset.monthly))
    );

    const pvPerformanceLayers = this.pvcalcDataset.annual.filterLayers(
      ({ key }) => ['PVOUT_specific', 'PVOUT_total', 'PR', 'CF'].includes(key)
    );

    this.pvPerformanceLayers$ = this.datasetService.dataLayersWithAccess$(pvPerformanceLayers, this.project$, true);

    this.pvPerformanceData$ = combineLatest([
      this.pvcalcAnnualData$,
      this.pvConfig$ as Observable<SystemPvConfig>,
      this.pvConfigStatus$
    ]).pipe(
      filter(([, , pvConfigStatus]) => pvConfigStatus === 'hasPvSystem'),
      map(([data, pvConfig]) => computeAveragePvPerformance(data, pvConfig))
    );

    this.glossaryLayers$ = combineLatest(
      this.solarLayers$,
      this.weatherLayers$,
      this.pvcalcLayers$,
      this.pvPerformanceLayers$,
      this.pvConfigStatus$
    ).pipe(
      map(([solar, weather, pvcalc, pvperformance, pvConfigStatus]) => {
        const result = [
          ...solar.toArray(),
          ...weather.toArray(),
        ];
        if (pvConfigStatus === 'hasPvSystem') {
          result.push(
            ...pvcalc.toArray(),
            pvperformance.get('CF')
          );
        }
        return result;
      })
    );

    this.overviewTiles$ = combineLatest(
      this.unitToggleService.selectUnitToggle(),
      this.solarMeteoData$,
      this.pvcalcData$
    ).pipe(
      map(([toggle, solarMeteoData, pvcalcData]) => (
        {
          solarMeteo: {
            annual: getAnnualData(solarMeteoData),
            monthly: toggleUnitValuesMap(toggle, getMonthlyData(solarMeteoData), this.ltaPvcalcDataset.monthly.toArray())
          },
          pvcalc: pvcalcData
            ? {
                annual: getAnnualData(pvcalcData),
                monthly: toggleUnitValuesMap(toggle, getMonthlyData(pvcalcData), this.pvcalcDataset.monthly.toArray())
              }
            : undefined
        }
      )),

      map(data => (data.pvcalc ? pvTileDefs : noPvTileDefs)
        .filter(def => !!data[def.datasetType])
        .map(def => {
          const dataset = def.datasetType === 'pvcalc' ? this.pvcalcDataset : this.ltaPvcalcDataset;
          const datasetData = data[def.datasetType];
          const monthlyStats = monthlyDataStats(datasetData.monthly, dataset.monthly);
          const layer = dataset.monthly.get(def.layerKey);
          return {
            ...def,
            annualLayer: dataset.annual.get(def.layerKey),
            annualData: datasetData.annual,
            monthlyChart: !isEmptyField(datasetData.monthly, layer.key)
              ? overviewMonthlyChartOpts(months, layer, datasetData.monthly, monthlyStats, overviewChartHeight)
              : undefined
          };
        })
      )
    );

  }

  redirect(url: string): void {
    let route = this.route;
    while (!(route.params as BehaviorSubject<any>).getValue().id) {route = route.parent;}
    this.router.navigate([ url ], {relativeTo: route, });
  }

  showOnMap(): void {
    this.project$.pipe(first()).subscribe(
      project => {
        this.store.dispatch(new MapCenter({
          lat: project.site.point.lat,
          lng: project.site.point.lng,
          zoom: 5
        }));
        this.redirect('../../map');
      }
    );
  }

  share(): void {
    this.dialog.open(ProjectShareDialogComponent, {});
  }

  trackByFn(index: number, item: OverviewTileOpts): any {
    return item.layerKey;
  }

  getExportChartOpts = (layer: DataLayer): Observable<ExportChartOpts> => combineLatest([this.project$, this.pvConfig$]).pipe(
      exportChartOptsOperator(layer, this.projectNamePipe)
    );

  openUpdateDataDialog(): void {
    this.project$.pipe(first()).subscribe(project =>
      this.store.dispatch(new OpenUpdateProjectDataDialog(getProjectDefaultEnergySystemRef(project, 'prospect')))
    );
  }
}
