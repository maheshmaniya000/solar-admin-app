import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { DataLayer, dataLayersToKeyStr, Dataset } from '@solargis/dataset-core';
import { resolveUnit$, resolveUnitValuesMap$ } from '@solargis/ng-unit-value';
import { DataStats, MonthlyHourlyData, MonthlyHourlyDataMap } from '@solargis/types/dataset';
import { hasPvConfig } from '@solargis/types/project';
import { Timezone } from '@solargis/types/site';
import { isEmpty } from '@solargis/types/utils';
import { UnitResolution } from '@solargis/units';

import {
  selectSelectedEnergySystem,
  selectSelectedEnergySystemProject,
  selectSelectedProjectAppData
} from 'ng-project/project-detail/selectors';
import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { State } from 'ng-project/project/reducers';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { canvasWithFooterToDataURL } from 'ng-project/project/utils/export-chart.utils';
import { mapDatasetData } from 'ng-project/project/utils/map-dataset-data.operator';
import { getDataStats } from 'ng-project/utils/stats.utils';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { downloadDataUrl } from 'ng-shared/shared/utils/download.utils';
import { months } from 'ng-shared/utils/translation.utils';

import { solarMeteoHourlyCharts } from './solar-meteo-hourly.charts';

@Component({
  selector: 'sg-solar-meteo-hourly',
  templateUrl: './solar-meteo-hourly.component.html',
  styleUrls: ['./solar-meteo-hourly.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolarMeteoHourlyComponent implements OnInit {

  // @HostBinding('@.disabled') disabled = true; // disable animation
  @ViewChildren('hourlyCharts') hourlyCharts: QueryList<ElementRef>;
  @ViewChildren('chartsTimezone') chartsTimezone: QueryList<ElementRef>;

  timezone$: Observable<Timezone>;
  data$: Observable<MonthlyHourlyDataMap>;
  chartsData$: Observable<any[]>; // TODO type
  energySystem$: Observable<any>;
  glossaryLayers$: Observable<DataLayer[]>;
  heatmaps$: Observable<{data: MonthlyHourlyData; stats: DataStats; layer: DataLayer}[]>;
  months = months;

  constructor(
    private readonly store: Store<State>,
    private readonly transloco: TranslocoService,
    private readonly projectNamePipe: ProjectNamePipe,
    @Inject(PVCALC_DATASET) private readonly pvcalcDataset: Dataset
  ) { }

  ngOnInit(): void {
    this.energySystem$ = this.store.pipe(selectSelectedEnergySystem);

    this.timezone$ = this.store.pipe(
      selectSelectedEnergySystemProject,
      map(project => project && project.site.timezone)
    );
    const hasPvConfig$ = this.store.pipe(selectSelectedEnergySystem, map(s => hasPvConfig(s as any)));

    const keys = ['GHI', 'DIF', 'DNI', 'GTI_opta', 'TEMP'];

    // prepare data
    this.data$ = this.store.pipe(
      selectSelectedProjectAppData,
      mapDatasetData('pvcalcDetails', 'monthly-hourly')
    );

    this.glossaryLayers$ = this.data$.pipe(
      map(data =>
        this.pvcalcDataset['monthly-hourly']
          .filterLayers(layer => keys.includes(layer.key) && (!data || !!data[layer.key]))
          .toArray()
      )
    );

    // prepare graphs
    const unitToggle$ = this.store.pipe(selectUnitToggle);

    const unitResolutions$: Observable<UnitResolution>[] = keys.map(key =>
      resolveUnit$(this.pvcalcDataset['monthly-hourly'].get(key).unit, unitToggle$, this.transloco));

    const layers = keys.map(key => this.pvcalcDataset['monthly-hourly'].get(key));

    this.chartsData$ = combineLatest([
      this.data$.pipe(switchMap(data => resolveUnitValuesMap$(unitToggle$, data, layers))),
      hasPvConfig$,
      ...unitResolutions$
    ]).pipe(
      filter(([data]) => !isEmpty(data)),
      map(([data, hasConfig, ...unitResolutions]: [MonthlyHourlyDataMap, boolean, ...UnitResolution[]]) => {

        const [ unitLabelsMap, unitFormatterMap ] = keys.reduce(([ul, tk], key, i) => [
          { ...ul, [key]: unitResolutions[i].html },
          { ...tk, [key]: unitResolutions[i].formatter() } ], [{}, {}]);

        const formatter = (val: number, key: string): any => unitFormatterMap[key](val);
        const stats = getDataStats(data);

        const ghiDniDifLayers = ['GHI', 'DNI', 'DIF'].map(key => this.getLayer(key));

        const gtiOptaTempLayers = (hasConfig ? ['TEMP'] : ['GTI_opta', 'TEMP'])
          .map(key => this.getLayer(key));

        return [
          solarMeteoHourlyCharts(ghiDniDifLayers, data, stats, unitLabelsMap, formatter),
          solarMeteoHourlyCharts(gtiOptaTempLayers, data, stats, unitLabelsMap, formatter, true),
        ];
      })
    );

    // prepare heatmaps
    const heatmapLayers = ['GHI', 'DNI', 'TEMP'];
    this.heatmaps$ = this.data$.pipe(
      filter(data => !isEmpty(data)),
      map(data => {
        const stats = getDataStats(data);
        const getLayer = (key): DataLayer => this.pvcalcDataset['monthly-hourly'].get(key);
        return heatmapLayers.map(key => ({ data: data[key], stats: stats[key], layer: getLayer(key) }));
      })
    );
  }

  getLayer(key: string): DataLayer {
    return this.pvcalcDataset['monthly-hourly'].get(key);
  }

  exportCharts(i: number, layers: DataLayer | DataLayer[]): void {
    this.store.pipe(selectSelectedEnergySystemProject).subscribe(project => {
      import('html2canvas').then(
        module => module.default(this.hourlyCharts.toArray()[i].nativeElement, {
          backgroundColor: 'white',
          ignoreElements: element => typeof element.className?.includes === 'function' && element.className?.includes('charts-timezone')
        })
      ).then(canvas => {
        const projectName = this.projectNamePipe.transform(project);
        const img = canvasWithFooterToDataURL(canvas, layers, projectName, null, project.site.timezone);
        const layerKeys = dataLayersToKeyStr(layers);

        downloadDataUrl(img, `Solargis_Chart_${projectName || 'Export'}_${layerKeys}.png`);
      });
    });
  }

}
