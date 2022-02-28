import { Options, SeriesOptions } from 'highcharts';

import { DataLayer } from '@solargis/dataset-core';
import { DataStatsMap } from '@solargis/types/dataset';

import { baseHighchartsOptions, getChartColors, getChartType } from 'ng-project/utils/chart.utils';

function overviewMonthlySeries(
  data: any,
  layerKey: string,
  type: string,
  showInLegend = false,
  unit = '',
  formatter?: (value: number, layerKeyName?: string) => string
): SeriesOptions {
  const res = {
    name: layerKey,
    showInLegend,
    unit,
    formatter: formatter ? value => formatter(value, layerKey) : undefined,
    data: data[layerKey],
    type: type ? type : ''
  };
  return res;
}

export function overviewMonthlyChartOpts(
  months: Array<any>,
  layer: DataLayer,
  data: any,
  dataStats: DataStatsMap,
  height = 320
): Options { // TODO make width dynamic

  const dataLayerStats = dataStats && dataStats[layer.key];
  const chartType = getChartType(layer);

  const opts: Options = Object.assign({}, baseHighchartsOptions, {
    chart: { height, width: null },
    xAxis: { ...baseHighchartsOptions.xAxis, categories: months, crosshair: true, tickWidth: 0 },
    yAxis: {
      ...baseHighchartsOptions.yAxis,
      tickInterval: 1,
      labels: { enabled: false },
      max: dataLayerStats ? dataLayerStats.max : undefined
    },
    colors: getChartColors(layer),
    series: [overviewMonthlySeries(data, layer.key, chartType)]
  });
  return opts;
}

