import {
  DataLayerDef,
  flattenDataLayers,
  ProspectConfig,
  prospectConfigFactory,
  ProspectConfigOpts
} from '@solargis/dataset-core';
import { DataLayersJson } from '@solargis/dataset-core/dist/main/data-layer.types';
import { RegionMetadata } from '@solargis/types/dataset';

import ltaLayersJson from '../defaults/lta.data-layers.json';
import ltaDataRegions from '../defaults/lta.regions.json';
import pvcalcLayersJson from '../defaults/pvcalc.data-layers.json';

export const ltaLayerDefs: DataLayerDef[] = flattenDataLayers(ltaLayersJson as DataLayersJson);
export const pvcalcLayerDefs: DataLayerDef[] = flattenDataLayers(pvcalcLayersJson as DataLayersJson);

export const prospectOpts: ProspectConfigOpts = {
  ltaDataset: { dataLayers: ltaLayerDefs, prefix: 'project.dataLayer' },
  pvcalcDataset: { dataLayers: pvcalcLayerDefs, prefix: 'project.dataLayer' },
  regions: ltaDataRegions as any as RegionMetadata[]
};

export const { ltaDataset, pvcalcDataset }: ProspectConfig = prospectConfigFactory(prospectOpts);
