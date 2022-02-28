import { InjectionToken } from '@angular/core';

import { DataLayerMap, Dataset, resolveDataset } from '@solargis/dataset-core';

import { ProspectAppConfig } from 'ng-shared/config';

// TODO move to prospect module

export const PVCALC_DATASET = new InjectionToken<DataLayerMap>('PvCalcDataset');

export function pvCalcDatasetFactory(config: ProspectAppConfig): Dataset {
  return resolveDataset(config.data.pvcalcLayers, { prefix: 'project.dataLayer' });
}
