import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

import { DataLayer, DataLayerMap, Dataset } from '@solargis/dataset-core';
import {
  addEmptyRowsAndCapacityFactor,
  computePvLosses,
  isRefRow,
  PvLossDiagramRow,
  PvLossGroup,
  PvLossTableRow,
  pvPerformanceGlossaryLayers,
  translateLossesRowKey
} from '@solargis/prospect-detail-calc';
import { AnnualDataMap } from '@solargis/types/dataset';
import { Unit, units } from '@solargis/units';

import { selectSelectedEnergySystemData, selectSelectedEnergySystem } from 'ng-project/project-detail/selectors';
import { State } from 'ng-project/project/reducers';
import { EnergySystemWithProgress } from 'ng-project/project/reducers/energy-systems.reducer';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { mapDatasetData } from 'ng-project/project/utils/map-dataset-data.operator';

@Component({
  selector: 'sg-performance-losses',
  templateUrl: './pv-performance-losses.component.html',
  styleUrls: ['./pv-performance-losses.component.scss']
})
export class PvPerformanceLossesComponent implements OnInit {
  lossesTable$: Observable<PvLossTableRow[]>;
  lossesDiagram$: Observable<PvLossDiagramRow[]>;

  annualData$: Observable<AnnualDataMap>;
  annualLayers: DataLayerMap;

  energySystem$: Observable<EnergySystemWithProgress>;

  columns = ['label', 'solarEnergy', 'solarEnergyDelta', 'pvEnergy', 'pvEnergyDelta', 'lossPercent', 'pr'];
  diagramColumns = ['sumLabel', 'loss', 'lossLabel'];

  percentUnit: Unit = units['%'];

  gtiLayer: DataLayer;
  pvoutSpecificLayer: DataLayer;

  translateRowKey = translateLossesRowKey;
  isRefRow = isRefRow;

  glossaryLayers: DataLayer[];

  constructor(
    private readonly store: Store<State>,
    @Inject(PVCALC_DATASET) pvcalcDataset: Dataset) {

    this.annualLayers = pvcalcDataset.annual;

    this.gtiLayer = this.annualLayers.get('GTI');
    this.pvoutSpecificLayer = this.annualLayers.get('PVOUT_specific');

    this.glossaryLayers = pvPerformanceGlossaryLayers(
      this.gtiLayer.unit, this.pvoutSpecificLayer.unit
    );
  }

  ngOnInit(): void {
    this.energySystem$ = this.store.pipe(selectSelectedEnergySystem);

    const systemData$ = this.store.pipe(selectSelectedEnergySystemData);

    this.annualData$ = systemData$.pipe(mapDatasetData('pvcalc', 'annual'));

    const losses$ = systemData$.pipe(
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
  }

  notEmpty(val): boolean {
    return typeof val !== 'undefined' && val !== null;
  }

  unitByGroup(group: PvLossGroup): Unit {
    switch (group) {
      case 'ghi': return this.annualLayers.get('GHI').unit;
      case 'gti': return this.annualLayers.get('GTI').unit;
      case 'pv': return this.annualLayers.get('PVOUT_specific').unit;
    }
  }
}
