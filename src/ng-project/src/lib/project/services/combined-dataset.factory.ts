import { InjectionToken } from '@angular/core';

import { combineDatasets, Dataset } from '@solargis/dataset-core';

export const LTA_PVCALC_COMBINED_DATASET = new InjectionToken<Dataset>('LtaPvcalcCombinedDataset');

export function combinedDatasetFactory(minor: Dataset, major: Dataset): Dataset {
  return combineDatasets(minor, major);
}

