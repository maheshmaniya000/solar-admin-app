import { DataLayer } from '@solargis/dataset-core';
import { PvConfig } from '@solargis/types/pv-config';

import { CompareItem } from 'ng-project/project/types/compare.types';

// mapping to highcharts ExportingMimeTypeValue
export enum ExportChartMimeType {
  PNG = 'image/png',
  SVG = 'image/svg+xml',
  PDF = 'application/pdf',
}

export type ExportChartOpts = {
  single?: {
    projectName: string;
    pvConfig?: PvConfig;
  };
  compare?: CompareItem[];
  layers: DataLayer | DataLayer[];
};
