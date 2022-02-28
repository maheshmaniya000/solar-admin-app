import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { updatedDiff } from 'deep-object-diff';
import { all as merge } from 'deepmerge';
import { cloneDeep } from 'lodash-es';
import { combineLatest } from 'rxjs';

import { isLatestDatasetDataMap } from '@solargis/dataset-core';
import {
  combineDataArray, LayerMetadata, mergeData, VersionedDatasetData, VersionedDatasetDataMap, VersionedDatasetMetadataMap, VersionMetadata
} from '@solargis/types/dataset';

import { State } from 'ng-project/project-detail/reducers';
import { selectSelectedEnergySystemData, selectSelectedProjectAppData } from 'ng-project/project-detail/selectors';
import { selectAppMetadata } from 'ng-project/project/selectors/metadata.selectors';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import * as defaultDataset from '../metadata/default-prospect-metadata';

type MetadataTableRow = {
  layerKey: string;
  layerMetadata: LayerMetadata;
  diff?: LayerMetadata;
};

type MetadataTable = MetadataTableRow[];

@Component({
  selector: 'sg-prospect-metadata',
  templateUrl: './prospect-metadata.component.html',
  styleUrls: ['./prospect-metadata.component.scss']
})
export class ProspectMetadataComponent extends SubscriptionAutoCloseComponent implements OnInit {

  uncertaintyUrl = 'https://solargis.com/docs/accuracy-and-comparisons/combined-uncertainty/';
  methodologyUrl = 'https://solargis.com/docs/methodology/solar-radiation-modeling/';
  simulationUrl = 'https://solargis.com/docs/methodology/pv-energy-modeling/';

  columns: string[] = ['parameter', 'sources', 'period', 'method', 'updated'];
  metadataTable: MetadataTable;
  prospectDatabaseVersion: string;
  latestProspectDatabaseVersion: string | null;

  constructor(private readonly store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      combineLatest([
        this.store.pipe(selectSelectedProjectAppData),
        this.store.pipe(selectSelectedEnergySystemData),
        this.store.select(selectAppMetadata('prospect'))
      ]).subscribe(data => this.onProjectAppOrEnergySystemOrMetadataChange(...data))
    );
  }

  private onProjectAppOrEnergySystemOrMetadataChange(
    projectAppData: VersionedDatasetDataMap,
    energySystemData: VersionedDatasetDataMap,
    latestMetadata: VersionedDatasetMetadataMap,
  ): void {
    const dataset = mergeData(projectAppData, energySystemData ?? {});
    const combinedData = this.combineData(dataset);

    this.prospectDatabaseVersion = combinedData.annual?.metadata?.version?.data;

    if(isLatestDatasetDataMap(dataset, latestMetadata)) {
      this.metadataTable = this.createMetadataTable(combinedData);
      this.latestProspectDatabaseVersion = null;

    } else {
      const diffBetweenProjectDataAndLatestMetadata = this.calculateDiffBetweenProjectDataAndLatestMetadata(
        combinedData, latestMetadata
      );

      this.latestProspectDatabaseVersion = diffBetweenProjectDataAndLatestMetadata.version?.data ?? null;
      this.metadataTable = this.createMetadataTable(combinedData, diffBetweenProjectDataAndLatestMetadata);
    }
  }

  private combineData(dataset: VersionedDatasetDataMap): VersionedDatasetData {
    return combineDataArray(
      dataset?.lta?.annual?.metadata?.layers ? dataset.lta : defaultDataset.lta,
      dataset?.pvcalcDetails?.annual?.metadata?.layers ? dataset.pvcalcDetails : defaultDataset.pvcalcDetails,
      dataset?.pvcalc ? (dataset?.pvcalc?.annual?.metadata?.layers ? dataset.pvcalc : defaultDataset.pvcalc) : {}
    );
  }

  private calculateDiffBetweenProjectDataAndLatestMetadata(
    combinedData: VersionedDatasetData,
    latestMetadata: VersionedDatasetMetadataMap
  ): Partial<VersionMetadata> {
    return updatedDiff(
      combinedData.annual.metadata,
      merge([
        latestMetadata?.lta, latestMetadata?.pvcalc, latestMetadata?.pvcalcDetails
      ], { arrayMerge: (destinationArray, sourceArray) => sourceArray }) as VersionMetadata
    );
  }

  private createMetadataTable(
    combinedData: VersionedDatasetData,
    diffBetweenProjectDataAndLatestMetadata?: Partial<VersionMetadata>
  ): MetadataTable {
    return Object.entries(combinedData.annual.metadata?.layers).map(
      ([key, value]) => {
        const layerDiff = diffBetweenProjectDataAndLatestMetadata?.layers[key];
        return {
          layerKey: key,
          layerMetadata: this.getLayerWithoutSatRegion(value),
          diff: layerDiff ? this.getLayerWithoutSatRegion(layerDiff) : undefined
        };
      }
    );
  }

  private getLayerWithoutSatRegion(layer: LayerMetadata): LayerMetadata {
    const result = cloneDeep(layer);
    if (result.period?.from === 'satregion') {
      result.period = {to: result.period.to};
    }
    return result;
  }
}
