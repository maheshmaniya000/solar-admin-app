
export type DataLayerColumn = {
  layerKey: string;
  dataset: string;
};

export const pvcalc: DataLayerColumn[] = [
  { dataset: 'pvcalc', layerKey: 'PVOUT_specific' },
  { dataset: 'pvcalc', layerKey: 'PVOUT_total' },
  { dataset: 'pvcalc', layerKey: 'PR' },
  { dataset: 'pvcalc', layerKey: 'GTI' },
  { dataset: 'pvcalc', layerKey: 'GTI_theoretical' },
];

export const pvcalcDetails: DataLayerColumn[] = [
  { dataset: 'pvcalcDetails', layerKey: 'GHI' },
  { dataset: 'pvcalcDetails', layerKey: 'DNI' },
  { dataset: 'pvcalcDetails', layerKey: 'DIF' },
  { dataset: 'pvcalcDetails', layerKey: 'D2G' },
  { dataset: 'pvcalcDetails', layerKey: 'GHI_season' },
  { dataset: 'pvcalcDetails', layerKey: 'DNI_season' },
  { dataset: 'pvcalcDetails', layerKey: 'GTI_opta' },
  { dataset: 'pvcalcDetails', layerKey: 'TEMP' },
];

/*
 * @deprecated - use dataset-access-service to get allowed data layers, no hardcoding layer keys
 */
export const hideLayersInFreeTrial =  [
  { layerKey: 'ALB' },
  { layerKey: 'WS' },
  { layerKey: 'RH' },
  { layerKey: 'PWAT' },
  { layerKey: 'PREC' },
  { layerKey: 'SNOWD' },
  { layerKey: 'GHI_season' },
  { layerKey: 'DNI_season' }
];
