import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import html2canvas from 'html2canvas';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { DataLayer, dataLayersToKeyStr, Dataset } from '@solargis/dataset-core';
import { resolveUnit$, resolveUnitValuesMap$ } from '@solargis/ng-unit-value';
import { AnyDataMap, DataStats, MonthlyHourlyData } from '@solargis/types/dataset';
import { Timezone } from '@solargis/types/site';
import { range } from '@solargis/types/utils';
import { UnitResolution } from '@solargis/units';

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
import { canvasWithFooterToDataURL } from 'ng-project/project/utils/export-chart.utils';
import { mapDatasetData } from 'ng-project/project/utils/map-dataset-data.operator';
import { hourlyChartOpts, legendChartOpts, oppositeHourlyChartOpts } from 'ng-project/utils/chart.utils';
import { getDataStats } from 'ng-project/utils/stats.utils';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { downloadDataUrl } from 'ng-shared/shared/utils/download.utils';
import { months } from 'ng-shared/utils/translation.utils';

@Component({
  selector: 'sg-pv-electricity-hourly',
  templateUrl: './pv-electricity-hourly.component.html',
  styleUrls: ['./pv-electricity-hourly.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvElectricityHourlyComponent implements OnInit {
  @ViewChild('hourlyCharts') hourlyCharts: ElementRef;

  timezone$: Observable<Timezone>;
  energySystem$: Observable<EnergySystemWithProgress>;
  tabs$: Observable<any[]>; // TODO type
  heatmaps$: Observable<{data: MonthlyHourlyData; stats: DataStats; layer: DataLayer}[]>;

  glossaryLayers: DataLayer[];
  months = months;
  selectedTabIndex = 0;

  constructor(
    private readonly store: Store<State>,
    private readonly transloco: TranslocoService,
    private readonly projectNamePipe: ProjectNamePipe,
    @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset) {}

  ngOnInit(): void {
    this.energySystem$ = this.store.pipe(selectSelectedEnergySystem);

    this.timezone$ = this.store.pipe(
      selectSelectedEnergySystemProject,
      map(project => project && project.site.timezone)
    );

    const unitToggle$ = this.store.pipe(selectUnitToggle);

    const pvcalcKeys = ['GTI', 'PVOUT_specific', 'PVOUT_total', 'TEMP'];

    // merge TEMP from pvcalcDetails into pvcalc
    const pvData$ = combineLatest(
      this.store.pipe(selectSelectedProjectAppData, mapDatasetData('pvcalcDetails', 'monthly-hourly')),
      this.store.pipe(selectSelectedEnergySystemData, mapDatasetData('pvcalc', 'monthly-hourly'))
    ).pipe(
      filter(([pvcalcDetails, pvcalc]) => !!(pvcalcDetails && pvcalc)),
      map(([pvcalcDetails, pvcalc]) => ({ ...pvcalc, TEMP: pvcalcDetails.TEMP }))
    );

    const pvDataAdj$ = pvData$.pipe(
      switchMap(data => {
        const layers = pvcalcKeys.map(key => this.pvcalcDataset['monthly-hourly'].get(key));
        return resolveUnitValuesMap$(unitToggle$, data, layers);
      })
    );

    const layerKeys = ['PVOUT_specific', 'PVOUT_total', 'GTI', 'TEMP'];

    const unitResolutions$: Observable<UnitResolution>[] = layerKeys.map(key =>
      resolveUnit$(this.pvcalcDataset['monthly-hourly'].get(key).unit, unitToggle$, this.transloco));

    const gtiTempLayers = ['GTI', 'TEMP'].map(key =>
      this.pvcalcDataset['monthly-hourly'].get(key)
    ) as [DataLayer, DataLayer];

    this.tabs$ = combineLatest(pvData$, pvDataAdj$, ...unitResolutions$).pipe(
      map(([pvcalcData, pvcalcDataAdj, ...unitResolutions]) => {
        const pvcalcStats = getDataStats(pvcalcData, pvcalcKeys);
        const pvcalcStatsAdj = getDataStats(pvcalcDataAdj, pvcalcKeys);

        const [unitLabelsMap, unitFormatterMap] = layerKeys.reduce(([ul, tk], key, i) => [
          {...ul, [key]: unitResolutions[i].html},
          {...tk, [key]: (unitResolutions[i] as any).formatter()}], [{}, {}]);

        const formatter = (val: number, key: string): any => unitFormatterMap[key](val);

        const result = [{
          keys: ['GTI', 'TEMP'],
          heatmap: { layer: gtiTempLayers[0] },
          legend: legendChartOpts(gtiTempLayers, unitLabelsMap),
          charts: range(12).map(i => oppositeHourlyChartOpts(
            gtiTempLayers,
            [pvcalcDataAdj.GTI[i], pvcalcDataAdj.TEMP[i]],
            [pvcalcStats.GTI, pvcalcStatsAdj.TEMP],
            unitLabelsMap,
            formatter)
          ),
          layers: gtiTempLayers as DataLayer[],
        }];

        return result.concat(['PVOUT_specific', 'PVOUT_total']
          .map(key => this.pvcalcDataset['monthly-hourly'].get(key))
          .map(layer => ({
            keys: [layer.key],
            heatmap: { layer },
            legend: legendChartOpts([layer], unitLabelsMap),
            charts: range(12).map(i => hourlyChartOpts(
              [layer],
              [pvcalcDataAdj[layer.key][i]],
              pvcalcStatsAdj[layer.key],
              unitLabelsMap,
              formatter)),
            layers: [layer],
          }))
        );
      })
    );

    this.heatmaps$ = pvData$.pipe(
      map((pvcalcData: AnyDataMap) => {
        const pvcalcStats = getDataStats(pvcalcData, pvcalcKeys);
        const heatmapLayers = [{
          layer: gtiTempLayers[0],
          stats: pvcalcStats.GTI,
          data: pvcalcData.GTI
        }];

        return heatmapLayers.concat(['PVOUT_specific', 'PVOUT_total']
          .map(key => this.pvcalcDataset['monthly-hourly'].get(key))
          .map(layer => ({
            layer,
            stats: pvcalcStats[layer.key],
            data: pvcalcData[layer.key],
          }))
        );
      })
    );

    this.glossaryLayers = pvcalcKeys.map(key => this.pvcalcDataset['monthly-hourly'].get(key));
  }

  tabIndexChange(id: number): void {
    this.selectedTabIndex = id;
  }

  exportCharts(i: number, layers: DataLayer | DataLayer[]): void {
    combineLatest([this.store.pipe(selectSelectedEnergySystemProject), this.energySystem$])
      .subscribe(([project, energySystem]) => {
        html2canvas(this.hourlyCharts.nativeElement, {backgroundColor: 'white'}).then(canvas => {
          const projectName = this.projectNamePipe.transform(project);
          const img = canvasWithFooterToDataURL(canvas, layers, projectName, energySystem.pvConfig, project.site.timezone);
          const layerKeys = dataLayersToKeyStr(layers);

          downloadDataUrl(img, `Solargis_Chart_${projectName || 'Export'}_${layerKeys}.png`);
        });
      });
  }

}
