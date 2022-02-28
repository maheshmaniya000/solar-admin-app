import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { DataLayer } from '@solargis/dataset-core';

import { CompareItem } from 'ng-project/project/types/compare.types';

export const onlyAbsoluteDifferences = ['D2G', 'GHI_season', 'DNI_season', 'ALB', 'TEMP', 'RH', 'PR', 'CF'];

export function calculateDiffs(value: number = 0, highlightValue: number = 0, layer?): { nominalDiff: number; percDiff: number } {
  const nominalDiff =
    (!highlightValue && highlightValue !== 0) || (!value && value !== 0)
      ? 0
      : Math.round((value - highlightValue) * 1000) / 1000;
  const noPerc = onlyAbsoluteDifferences.some(item => item === layer);
  const percDiff = (noPerc || !highlightValue) && !!nominalDiff ? null : Math.round(nominalDiff / highlightValue * 100);
  return { nominalDiff, percDiff };
}

export class PercentDiff {
  [key: number]: number;
}

export type OverviewLayers = {
  [key: string]: number;
} & {
  layer: string;
  maxValue: number;
  hasHighlightBadge: boolean;
  percentDiff: PercentDiff;
};

export type CompareMonth = {
  [key: number]: number;
};

export type CompareYear = number[];
export type ComparePeriod = CompareYear | CompareMonth;

export function getLayersDiffs(
  comparePeriod: ComparePeriod,
  highlightIndex: number | string,
  highlightValue: number,
  layer: string
): [PercentDiff, ComparePeriod] {
  const percentDiff: PercentDiff = new PercentDiff();
  Object.entries(comparePeriod).forEach(([key, value]) => {
    if (key.toString() !== highlightIndex.toString()) {
      value = layer === 'SNOWD' && value === -1 ? 0 : value;
      highlightValue = layer === 'SNOWD' && highlightValue === -1 ? 0 : highlightValue;
      const { nominalDiff, percDiff } = calculateDiffs(value, highlightValue, layer);
      if (!percDiff && percDiff !== 0 || layer === 'SNOWD') {
        percentDiff[key] = ' (-)';
      } else {
        percentDiff[key] = percDiff <= 0 ? ` (${percDiff}%)` : ` (+${percDiff}%)`;
      }
      comparePeriod[key] = nominalDiff;
    } else {
      percentDiff[key] = null;
    }
  });
  return [percentDiff, comparePeriod];
}

function getDataSet(
  highlightedItem: CompareItem,
  layer: string,
  compareSet: OverviewLayers,
  highlightIndex: string,
  highlightLayers: string[],
  maxValue: number
): OverviewLayers {
  if (highlightedItem) {
    const [percentDiff, nominalDiff] = getLayersDiffs(compareSet, highlightIndex, compareSet[highlightIndex], layer);
    compareSet.percentDiff = percentDiff;
    Object.entries(nominalDiff).forEach(([key, value]) => {
      compareSet[key] = value;
    });
  }
  compareSet.layer = layer;
  compareSet.maxValue = maxValue;
  compareSet.hasHighlightBadge = highlightLayers.includes(layer);
  return compareSet;
}

export function getOverviewLayers(compare: CompareItem[], data, layersWithPerm: DataLayer[], highlightLayers: string[]): OverviewLayers[] {
  const layers: string[] = layersWithPerm.map(item => item.key);
  const highlightedItem = compare.find(item => item.highlighted);
  const highlightIndex = !!highlightedItem && !!highlightedItem.energySystemId ? highlightedItem.energySystemId : '';
  return layers.map(layer => {
    const values = Object.values<any>(data).map(item => !!item && !!item.annual ? item.annual.data[layer] : null);
    const maxValue = Math.max(...values);
    const compareSet = compare.reduce((acc: OverviewLayers, compareItem: CompareItem) => {
      acc[compareItem.energySystemId] = !!data[compareItem.energySystemId] &&
      !!data[compareItem.energySystemId].annual ? data[compareItem.energySystemId].annual.data[layer] : null;
      return acc;
    }, {} as OverviewLayers);
    return getDataSet(highlightedItem, layer, compareSet, highlightIndex, highlightLayers, maxValue);
  });
}

function getOverviewPerformanceLayers(
  compare: CompareItem[],
  data: any,
  layersWithPerm: DataLayer[],
  highlightLayers: string[]
): OverviewLayers[] {
  if (!data) {return null;}
  const layers: string[] = layersWithPerm.map(item => item.key);
  const highlightedItem = compare.find(item => item.highlighted);
  const highlightIndex = !!highlightedItem && !!highlightedItem.energySystemId ? highlightedItem.energySystemId : '';
  return layers.map(layer => {
    const values = Object.values(data).map(item => !!item && !!item[layer] ? item[layer] : null);
    const maxValue = Math.max(...values);
    const compareSet = compare.reduce((acc: OverviewLayers, compareItem: CompareItem) => {
      acc[compareItem.energySystemId] = !!data[compareItem.energySystemId] &&
      !!data[compareItem.energySystemId][layer] ? data[compareItem.energySystemId][layer] : null;
      return acc;
    }, {} as OverviewLayers);
    return getDataSet(highlightedItem, layer, compareSet, highlightIndex, highlightLayers, maxValue);
  });
}

export function getDataSource(
  compare$: Observable<CompareItem[]>,
  data$: Observable<any>,
  layersWithPerm$: Observable<DataLayer[]>,
  highlightLayers: string[]
): Observable<OverviewLayers[]> {
  return (
    combineLatest([compare$, data$, layersWithPerm$]).pipe(
      debounceTime(50),
      map(([compare, data, layersWithPerm]) => getOverviewLayers(compare, data, layersWithPerm, highlightLayers)),
      distinctUntilChanged()
    )
  );
}

export function getPerformanceDataSource(
  compare$: Observable<CompareItem[]>,
  data$: Observable<any>,
  layersWithPerm$: Observable<DataLayer[]>,
  highlightLayers: string[]
): Observable<OverviewLayers[]> {
  return (
    combineLatest([compare$, data$, layersWithPerm$]).pipe(
      debounceTime(50),
      map(([compare, data, layersWithPerm]) => getOverviewPerformanceLayers(compare, data, layersWithPerm, highlightLayers)),
      distinctUntilChanged()
    )
  );
}
