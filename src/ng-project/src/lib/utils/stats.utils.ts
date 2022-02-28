import { DataLayerMap } from '@solargis/dataset-core';
import { DataStatsMap, MonthlyDataMap, MonthlyHourlyDataMap } from '@solargis/types/dataset';

function compute(data: number[][], fn): number {
  return fn(
    ...data.map(row => fn(...row))
  );
}

export function getDataStats(data: MonthlyHourlyDataMap, keys?: string[]): DataStatsMap {
  if (!keys) {keys = Object.keys(data);}

  const stats: DataStatsMap = {};
  keys.forEach(key => {
    stats[key] = {
      min: compute(data[key], Math.min),
      max: compute(data[key], Math.max)
    };
  });
  return stats;
}

export function monthlyDataStats(monthlyData: MonthlyDataMap, monthlyLayers: DataLayerMap): DataStatsMap {
  if (!monthlyData) {return undefined;}

  const dataByUnit = Object.keys(monthlyData).reduce((byUnit, key) => {
    const unitId = monthlyLayers.get(key).unitId;
    if (monthlyData[key]) {
      (byUnit[unitId] || (byUnit[unitId] = [])).push(...monthlyData[key]);
    }
    return byUnit;
  }, {});

  const statsByUnit = Object.keys(dataByUnit).reduce((stats, unitId) => {
    stats[unitId] = {
      min: Math.min(0, ...dataByUnit[unitId]),
      max: Math.max(...dataByUnit[unitId])
    };
    return stats;
  }, {});

  return Object.keys(monthlyData).reduce((stats, key) => {
    const unitId = monthlyLayers.get(key).unitId;
    stats[key] = statsByUnit[unitId];
    return stats;
  }, {});
}
