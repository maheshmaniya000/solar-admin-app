import { AnnualData, MonthlyData, MonthlyHourlyData, VersionedDatasetDataMap } from '@solargis/types/dataset';

import { EnergySystemWithProgress } from 'ng-project/project/reducers/energy-systems.reducer';

export type CompareDataMap = {[energySystemRef: string]: VersionedDatasetDataMap};
export type CompareDataResolvedMap = {
  [energySystemRef: string]: {
    annual?: AnnualData;
    monthly?: MonthlyData;
    'monthly-hourly'?: MonthlyHourlyData;
  };
};

export type CompareEnergySystems = {
  [key: string]: EnergySystemWithProgress;
};
