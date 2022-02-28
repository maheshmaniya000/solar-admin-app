import { InjectionToken } from '@angular/core';

import { Dataset, resolveDataset } from '@solargis/dataset-core';

import { HasMapAndDataConfig } from 'ng-shared/config';

// TODO move to prospect module

export const LTA_DATASET = new InjectionToken<Dataset>('LtaDataset');

export function ltaDatasetFactory(config: HasMapAndDataConfig): Dataset {
  const dataKeyToMapId = config.map.layers.reduce((res, mapLayer) => {
    if (mapLayer.dataKey) {
      res[mapLayer.dataKey] = mapLayer._id;
    }
    return res;
  }, {});

  const layerDefsWithMapId = config.data.ltaLayers.map(
    layer => ({ ...layer, mapId: dataKeyToMapId[layer.key] }));

  return resolveDataset(layerDefsWithMapId, { prefix: 'project.dataLayer', codelistPrefix: 'codelist'});
}
