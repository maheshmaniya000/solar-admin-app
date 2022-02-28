import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';

import { DataLayer, Dataset } from '@solargis/dataset-core';
import { computeAveragePvPerformance, PvAveragePerformance, PV_LIFETIME_PERFORMANCE_YEARS } from '@solargis/prospect-detail-calc';
import { EnergySystem, hasPvConfig } from '@solargis/types/project';
import { SystemPvConfig } from '@solargis/types/pv-config';

import { State } from 'ng-project/project/reducers';
import { selectCompareItems, selectCompareItemsWithPvConfig } from 'ng-project/project/selectors/compare.selectors';
import { DatasetAccessService } from 'ng-project/project/services/dataset-access.service';
import { LTA_DATASET } from 'ng-project/project/services/lta-dataset.factory';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { CompareEnergySystems } from '../../compare.types';
import { selectCompareAppData, selectCompareEnergySystemData, selectCompareEnergySystems, } from '../../selectors/compare.selectors';
import { getDataSource, getPerformanceDataSource, OverviewLayers } from '../../utils/compare-layers.utils';

const solarParams = ['GHI', 'DNI', 'DIF', 'D2G', 'GHI_season', 'DNI_season', 'ALB', 'GTI_opta'];
const meteoParams = ['TEMP', 'WS', 'RH', 'PWAT', 'PREC', 'SNOWD', 'CDD', 'HDD'];
const pvElectricityParams = ['PVOUT_specific', 'PVOUT_total', 'PR', 'GTI', 'GTI_theoretical'];
const pvPerformanceParams = ['PVOUT_specific', 'PVOUT_total', 'PR', 'CF'];
const highlightLayers = ['GHI', 'DNI', 'DIF', 'D2G', 'GTI_opta', 'PVOUT_specific', 'PVOUT_total', 'PR', 'GTI', 'GTI_theoretical'];

interface PvData {
  [key: string]: Observable<PvAveragePerformance>;
}

@Component({
  selector: 'sg-project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent extends SubscriptionAutoCloseComponent implements OnInit {

  solarDataSource$: Observable<OverviewLayers[]>;
  meteoDataSource$: Observable<OverviewLayers[]>;
  pvElectricityDataSource$: Observable<OverviewLayers[]>;
  pvPerformanceDataSource$: Observable<OverviewLayers[]>;
  pvElectricityCompare$: Observable<CompareItem[]>;
  solarAndMeteoCompare$: Observable<CompareItem[]>;
  solarAndMeteoColumns$: Observable<string[]>;
  pvElectricityColumns$: Observable<string[]>;
  isProjectSelected = false;
  solarLayersWithPerm$: Observable<DataLayer[]>;
  meteoLayersWithPerm$: Observable<DataLayer[]>;
  pvElectricityLayersWithPerm$: Observable<DataLayer[]>;
  pvPerformanceLayersWithPerm$: Observable<DataLayer[]>;
  compareEnergySystems$: Observable<CompareEnergySystems>;
  pvPerformanceData$ = new BehaviorSubject(null);
  lifetimeYears = PV_LIFETIME_PERFORMANCE_YEARS;

  selectedEnergySysId: Observable<string>;

  constructor(
    private readonly store: Store<State>,
    private readonly datasetService: DatasetAccessService,
    private readonly router: Router,
    @Inject(LTA_DATASET) public ltaDataset: Dataset,
    @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset,
  ) {
    super();
  }

  ngOnInit(): void {
    const solarLayers = solarParams.map(key => this.ltaDataset.annual.get(key));
    const meteoLayers = meteoParams.map(key => this.ltaDataset.annual.get(key));
    const pvElectricityLayers = pvElectricityParams.map(key => this.pvcalcDataset.annual.get(key));
    const pvPerformanceLayers = pvPerformanceParams.map(key => this.pvcalcDataset.annual.get(key));

    this.solarAndMeteoCompare$ = this.store.pipe(selectCompareItems);

    this.pvElectricityCompare$ = this.store.pipe(selectCompareItemsWithPvConfig);
    this.solarLayersWithPerm$ = this.datasetService.filterLayersByPermissions(solarLayers);
    this.meteoLayersWithPerm$ = this.datasetService.filterLayersByPermissions(meteoLayers);
    this.pvElectricityLayersWithPerm$ = this.datasetService.filterLayersByPermissions(pvElectricityLayers);

    this.subscriptions.push(
      this.solarAndMeteoCompare$
        .subscribe(compare => this.isProjectSelected =
          compare.findIndex(i => i.highlighted) >= 0)
    );

    this.selectedEnergySysId = this.solarAndMeteoCompare$.pipe(
      map(items => {
        const selectedItem = items.find(item => item.highlighted);
        return !!selectedItem && !!selectedItem.energySystemId ? selectedItem.energySystemId : null;
      })
    );

    this.compareEnergySystems$ = this.store.pipe(selectCompareEnergySystems);

    this.solarAndMeteoColumns$ = this.solarAndMeteoCompare$.pipe(
      map(compare => {
        const cols = compare.map(item => item.energySystemId);
        return ['layer', ...cols];
      }),
      distinctUntilChanged()
    );

    this.pvElectricityColumns$ = this.pvElectricityCompare$.pipe(
      map(compare => {
        const cols = compare.map(item => item.energySystemId);
        return ['layer', ...cols];
      }),
      distinctUntilChanged()
    );

    const appData$ = this.store.pipe(selectCompareAppData);
    const energySysData$ = this.store.pipe(selectCompareEnergySystemData).pipe(
      filter(data => Object.values(data).some(val => !!val)),
    );

    this.solarDataSource$ = getDataSource(this.solarAndMeteoCompare$, appData$, this.solarLayersWithPerm$, highlightLayers);
    this.meteoDataSource$ = getDataSource(this.solarAndMeteoCompare$, appData$, this.meteoLayersWithPerm$, highlightLayers);
    this.pvElectricityDataSource$ = getDataSource(
      this.pvElectricityCompare$, energySysData$, this.pvElectricityLayersWithPerm$, highlightLayers
    );

    this.subscriptions.push(
      combineLatest([energySysData$, this.compareEnergySystems$]).pipe(
        map(([data, energySystems]) => Object.keys(data).reduce((acc, key) => {
            if (hasPvConfig(energySystems[key] as EnergySystem)) {
              const performanceData = computeAveragePvPerformance(
                !!data[key] && data[key].annual ? data[key].annual.data : 0,
                energySystems[key].pvConfig as SystemPvConfig
              );
              acc[key] = performanceData;
            }
            return acc;
          }, {})),
        tap(data => {
          const pvData: PvData = {};
          Object.keys(data).map(key => {
            pvData[key] = data[key];
            this.pvPerformanceData$.next(pvData);
          });
        })
      ).subscribe()
    );

    this.pvPerformanceLayersWithPerm$ = this.datasetService.filterLayersByPermissions(pvPerformanceLayers);
    this.pvPerformanceDataSource$ = getPerformanceDataSource(
      this.pvElectricityCompare$, this.pvPerformanceData$, this.pvPerformanceLayersWithPerm$, highlightLayers
    );
  }

  solarAndMeteoLayer(key: string): DataLayer {
    return this.ltaDataset.annual.get(key);
  }

  pvElectricityLayer(key: string): DataLayer {
    return this.pvcalcDataset.annual.get(key);
  }

  redirect(path: string[]): void {
    this.router.navigate(path);
  }
}
