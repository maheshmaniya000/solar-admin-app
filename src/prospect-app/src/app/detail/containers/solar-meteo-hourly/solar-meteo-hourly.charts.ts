import { Options } from 'highcharts';

import { DataLayer } from '@solargis/dataset-core';
import { DataStatsMap, MonthlyHourlyDataMap } from '@solargis/types/dataset';
import { range } from '@solargis/types/utils';

import { hourlyChartOpts, legendChartOpts, oppositeHourlyChartOpts } from 'ng-project/utils/chart.utils';

export function solarMeteoHourlyCharts(
  layers: DataLayer[],
  data: MonthlyHourlyDataMap,
  stats: DataStatsMap,
  unitLabels: { [key: string]: string },
  formatter?: (value: number, layerKey?: string) => string,
  dualYAxis = false): {
    layers: DataLayer[];
    series: any[];
    legend: Options;
  }{

  const result = {
    layers,
    series: [],
    legend: legendChartOpts(layers, unitLabels)
  };

  range(12).forEach(month => {
    let extremes: any;

    const series = layers.map(layer => data[layer.key] ? data[layer.key][month] : undefined);

    if (dualYAxis) {
      extremes = layers.map(layer => ({min: stats[layer.key].min, max: stats[layer.key].max}));
      result.series.push(oppositeHourlyChartOpts(layers as [DataLayer, DataLayer], series, extremes, unitLabels, formatter));

    } else {
      const min = Math.min(...layers.map(layer => stats[layer.key].min));
      const max = Math.max(...layers.map(layer => stats[layer.key].max));
      extremes = { min, max };
      result.series.push(hourlyChartOpts(layers, series, extremes, unitLabels, formatter));
    }
  });
  return result;
}
