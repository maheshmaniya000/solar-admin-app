import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Options } from 'highcharts';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DataLayer, DataLayerMap, Dataset } from '@solargis/dataset-core';
import { resolveUnit$, resolveUnitValuesMap$ } from '@solargis/ng-unit-value';
import { computePvLifetimePerformance, PvLifetimePerformance } from '@solargis/prospect-detail-calc';
import { Project } from '@solargis/types/project';
import { SystemPvConfig } from '@solargis/types/pv-config';
import { UnitResolution, units } from '@solargis/units';

import {
  selectSelectedEnergySystem,
  selectSelectedEnergySystemData,
  selectSelectedEnergySystemProject
} from 'ng-project/project-detail/selectors';
import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { EnergySystemWithProgress } from 'ng-project/project/reducers/energy-systems.reducer';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { ExportChartOpts } from 'ng-project/project/types/export-chart.types';
import { exportChartOptsOperator } from 'ng-project/project/utils/export-chart-opts.operator';
import { mapDatasetData } from 'ng-project/project/utils/map-dataset-data.operator';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';

import { performanceRatioChart, pvYieldChart } from './pv-lifetime-performance.charts';


@Component({
  selector: 'sg-pv-lifetime-performance',
  templateUrl: './pv-lifetime-performance.component.html',
  styleUrls: ['./pv-lifetime-performance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvLifetimePerformanceComponent implements OnInit {
  project$: Observable<Project>;
  energySystem$: Observable<EnergySystemWithProgress>;

  columns = ['id', 'DEGRAD', 'PVOUT_specific', 'PVOUT_total', 'PR'];
  performanceTable$: Observable<PvLifetimePerformance[]>;

  performanceRatioChart$: Observable<Options>;
  pvTotalChart$: Observable<Options>;
  pvSpecificChart$: Observable<Options>;

  yearlyData$: Observable<{[key: string]: number}>;

  glossaryLayers$ = new BehaviorSubject<DataLayer[]>([]);

  pvcalcLayers: DataLayerMap;
  percentUnit = units['%'];

  constructor(
    private readonly store: Store<State>,
    private readonly transloco: TranslocoService,
    private readonly projectNamePipe: ProjectNamePipe,
    @Inject(PVCALC_DATASET) pvcalcDataset: Dataset
  ) {
    this.pvcalcLayers = pvcalcDataset.annual;
  }

  ngOnInit(): void {
    this.project$ = this.store.pipe(selectSelectedEnergySystemProject);

    this.energySystem$ = this.store.pipe(selectSelectedEnergySystem);

    const pvcalcAnnual$ = this.store.pipe(
      selectSelectedEnergySystemData,
      mapDatasetData('pvcalc', 'annual')
    );

    const pvConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system && system.pvConfig)
    ) as Observable<SystemPvConfig>;

    this.performanceTable$ = combineLatest(
      pvcalcAnnual$,
      pvConfig$
    ).pipe(
      map(([pvCalcAnnual, pvConfig]) => computePvLifetimePerformance(pvCalcAnnual, pvConfig))
    );

    const unitToggle$ = this.store.pipe(selectUnitToggle);

    const unitResolution$ = (unitKey: string): Observable<UnitResolution> =>
      resolveUnit$(
        this.pvcalcLayers.get(unitKey).unit,
        unitToggle$,
        this.transloco
      );

    const yearStr$ = this.transloco.selectTranslate('projectDetail.pvPerformance.endOfYear');

    this.performanceRatioChart$ = combineLatest(
      this.performanceTable$,
      unitResolution$('PR'),
      yearStr$,
    ).pipe(
      map(([data, unitResolution, yearStr]) => performanceRatioChart(
        data.filter(row => row.id >= 0).map(row => row.PR),
        unitResolution.html,
        unitResolution.formatter(),
        yearStr
      ))
    );

    // resolve graph data
    const layers = [ this.pvcalcLayers.get('PVOUT_specific'), this.pvcalcLayers.get('PVOUT_total')];
    const resolvedData$ = this.performanceTable$.pipe(
      map(data => [
        ({
          PVOUT_specific: data.filter(row => row.id === 'avg').map(row => row.PVOUT_specific),
          PVOUT_total: data.filter(row => row.id === 'avg').map(row => row.PVOUT_total)
        }),
        ({
          PVOUT_specific: data.filter(row => row.id >= 0).map(row => row.PVOUT_specific),
          PVOUT_total: data.filter(row => row.id >= 0).map(row => row.PVOUT_total)
        }),
      ]),
      switchMap(([avgData, yearlyData]) => combineLatest(
        resolveUnitValuesMap$(unitToggle$, avgData, layers),
        resolveUnitValuesMap$(unitToggle$, yearlyData, layers)
      )),
      map(data => ({ avg: data[0] as any as {[key: string]: number}, yearly: data[1] as any as {[key: string]: number[] } }))
    );

    this.pvSpecificChart$ = combineLatest(
      resolvedData$,
      unitResolution$('PVOUT_specific'),
      yearStr$
    ).pipe(
      map(([data, unitResolution, yearStr]) => pvYieldChart(
        data.yearly.PVOUT_specific,
        data.avg.PVOUT_specific,
        unitResolution.html,
        unitResolution.formatter(),
        yearStr
      ))
    );

    this.pvTotalChart$ = combineLatest(
      resolvedData$,
      unitResolution$('PVOUT_total'),
      yearStr$
    ).pipe(
      map(([data, unitResolution, yearStr]) => pvYieldChart(
        data.yearly.PVOUT_total,
        data.avg.PVOUT_total,
        unitResolution.html,
        unitResolution.formatter(),
        yearStr
      ))
    );

    // top summary
    this.yearlyData$ = this.performanceTable$.pipe(
      map(data => ({
        PR: data.find(row => row.id === 'avg').PR,
        PVOUT_specific: data.find(row => row.id === 'avg').PVOUT_specific
      }))
    );

    this.glossaryLayers$.next([
      this.pvcalcLayers.get('PR'),
      this.pvcalcLayers.get('PVOUT_specific'),
      this.pvcalcLayers.get('PVOUT_total')
    ]);
  }

  getExportChartOpts = (layerKey: string): Observable<ExportChartOpts> => {
    const pvConfig$ = this.energySystem$.pipe(
      map(energySystem => energySystem.pvConfig)
    );

    return combineLatest([this.project$, pvConfig$]).pipe(
      exportChartOptsOperator(this.pvcalcLayers.get(layerKey), this.projectNamePipe)
    );
  };

}
