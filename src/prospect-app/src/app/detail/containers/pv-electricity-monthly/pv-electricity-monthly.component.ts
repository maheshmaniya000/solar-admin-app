import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Options } from 'highcharts';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, publishReplay, refCount, switchMap } from 'rxjs/operators';

import { DataLayer, Dataset } from '@solargis/dataset-core';
import { resolveUnit$, resolveUnitValuesMap$ } from '@solargis/ng-unit-value';
import { AnnualDataMap, combineDataArray, MonthlyDataMap, VersionedDatasetData } from '@solargis/types/dataset';
import { Project } from '@solargis/types/project';
import { Unit, UnitResolution } from '@solargis/units';

import {
  selectSelectedEnergySystem,
  selectSelectedEnergySystemData,
  selectSelectedEnergySystemProject,
  selectSelectedProjectAppData
} from 'ng-project/project-detail/selectors';
import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { EnergySystemWithProgress } from 'ng-project/project/reducers/energy-systems.reducer';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { ExportChartOpts } from 'ng-project/project/types/export-chart.types';
import { exportChartOptsOperator } from 'ng-project/project/utils/export-chart-opts.operator';
import { monthlyChartOpts } from 'ng-project/utils/chart.utils';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { monthsTranslated$ } from 'ng-shared/utils/translation.utils';

import { PvElectricityMonthlyDataSource } from './pv-electricity-monthly.data-source';

@Component({
  selector: 'sg-pv-electricity-monthly',
  templateUrl: './pv-electricity-monthly.component.html',
  styleUrls: ['./pv-electricity-monthly.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvElectricityMonthlyComponent implements OnInit {
  project$: Observable<Project>;
  energySystem$: Observable<EnergySystemWithProgress>;

  dataSource: PvElectricityMonthlyDataSource;
  dataColumns = ['GTI', 'PVOUT_specific', 'PVOUT_total', 'PR'];
  columns = ['month'].concat(this.dataColumns);

  // this could be generalized with only one Observable
  PVOUTtotalChart$: Observable<Options>;
  PVOUTspecificChart$: Observable<Options>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GTI_TEMPChart$: Observable<Options>;

  annual$: Observable<AnnualDataMap>;

  pvcalcLayers: DataLayer[] = [];

  selectedTabIndex = 1;

  constructor(
    private readonly store: Store<State>,
    private readonly transloco: TranslocoService,
    private readonly projectNamePipe: ProjectNamePipe,
    @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset,
  ) { }

  ngOnInit(): void {
    this.project$ = this.store.pipe(selectSelectedEnergySystemProject);

    this.energySystem$ = this.store.pipe(selectSelectedEnergySystem);

    const data$: Observable<VersionedDatasetData> = combineLatest(
      this.store.pipe(selectSelectedProjectAppData),
      this.store.pipe(selectSelectedEnergySystemData)
    ).pipe(
      map(([appData, systemData]) => combineDataArray(
        appData && appData.pvcalcDetails, systemData && systemData.pvcalc
      )),
      publishReplay(),
      refCount()
    );

    this.dataSource = new PvElectricityMonthlyDataSource(data$);

    this.annual$ = data$.pipe(
      filter(pvcalc => pvcalc && !!pvcalc.annual),
      map(pvcalc => pvcalc.annual.data)
    );

    const unitToggle$ = this.store.pipe(selectUnitToggle);

    const monthly$ = data$.pipe(
      filter(pvcalc => pvcalc && !!pvcalc.monthly),
      map(pvcalc => pvcalc.monthly.data),
      switchMap(monthlyData => resolveUnitValuesMap$(unitToggle$, monthlyData, this.pvcalcLayers)),
      distinctUntilChanged()
    );

    const layerKeys = ['GTI', 'PVOUT_total', 'PVOUT_specific', 'TEMP', 'PR'];
    const months$ = monthsTranslated$(this.transloco);

    this.pvcalcLayers = layerKeys.map(key => this.pvcalcDataset.monthly.get(key));

    const unitResolution$ = (layerKey: string): Observable<UnitResolution> => resolveUnit$(
      this.pvcalcLayers[layerKeys.indexOf(layerKey)].unit, unitToggle$, this.transloco);

    this.PVOUTtotalChart$ = combineLatest(monthly$, months$, unitResolution$('PVOUT_total')).pipe(
      map(([data, months, unitResolution]) =>
        monthlyChartOpts(
          months, this.monthlyDataLayer('PVOUT_total'),
          data, unitResolution.html, unitResolution.formatter()
        ))
    );

    this.PVOUTspecificChart$ = combineLatest(
      monthly$, months$, unitResolution$('PVOUT_specific'), unitResolution$('PR')
    ).pipe(
      map(([monthly, months, ...unitResolutions]) => {
        const selectedKeys = [ 'PVOUT_specific', 'PR' ];
        const selectedLayers = selectedKeys.map(key => this.monthlyDataLayer(key));
        const [ unitLabelsMap, unitFormatterMap ] = selectedKeys.reduce(([ul, tk], key, i) => [
          { ...ul, [key]: (unitResolutions[i] as UnitResolution).html },
          { ...tk, [key]: (unitResolutions[i] as UnitResolution).formatter() } ], [{}, {}]);
        const formatter = (val: number, key: string): any => unitFormatterMap[key](val);
        return monthlyChartOpts(months, selectedLayers, monthly as MonthlyDataMap, unitLabelsMap, formatter);
      })
    );

    this.GTI_TEMPChart$ = combineLatest(
      monthly$, months$, unitResolution$('GTI'), unitResolution$('TEMP')
    ).pipe(
      map(([data, months, ...unitResolutions]) => {
        const selectedKeys = [ 'GTI', 'TEMP' ];
        const selectedLayers = selectedKeys.map(key => this.monthlyDataLayer(key));
        const [ unitLabelsMap, unitFormatterMap ] = selectedKeys.reduce(([ul, tk], key, i) => [
          { ...ul, [key]: (unitResolutions[i] as UnitResolution).html },
          { ...tk, [key]: (unitResolutions[i] as UnitResolution).formatter() } ], [{}, {}]);
        const formatter = (val: number, key: string): any => unitFormatterMap[key](val);
        return monthlyChartOpts(months, selectedLayers, data as MonthlyDataMap, unitLabelsMap, formatter);
      })
    );
  }

  unit(key: string, monthIndex: number): Unit {
    return typeof monthIndex === 'undefined'
      ? this.pvcalcDataset.annual.get(key).unit
      : this.pvcalcDataset.monthly.get(key).unit;
  }

  monthlyDataLayer(key: string): DataLayer {
    return this.pvcalcDataset.monthly.get(key);
  }

  tabIndexChange(id: number): void {
    this.selectedTabIndex = id;
  }

  getExportChartOpts = (layerKeys: string[]): Observable<ExportChartOpts> => {
    const pvConfig$ = this.energySystem$.pipe(
      map(energySystem => energySystem.pvConfig)
    );

    return combineLatest([this.project$, pvConfig$]).pipe(
      exportChartOptsOperator(layerKeys.map(k => this.monthlyDataLayer(k)), this.projectNamePipe)
    );
  };

}
