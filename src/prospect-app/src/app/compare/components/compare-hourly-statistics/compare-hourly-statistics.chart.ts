import { Options, Series, SeriesLegendItemClickEventObject, SeriesOptions } from 'highcharts';

import { range } from '@solargis/types/utils';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { cloneOptions } from 'ng-project/utils/chart.utils';

import { compareColors } from '../../compare.colors';
import { CompareDataResolvedMap } from '../../compare.types';
import { baseCompareChartOptions, baseCompareChartType } from '../compare-monthly-statistics/compare-monthly-statistics.chart';

export function getCompareHourlyCharts(
  compare: CompareItem[],
  data: CompareDataResolvedMap,
  unitResolution: string,
  projectNamePipe: ProjectNamePipe,
): Options[] {
  const vals = compare.map(item => data[item.energySystemId]['monthly-hourly']);
  const compute = (fn, d): any => fn(...d.map(x => Array.isArray(x) ? compute(fn, x) : x));
  const min = compute(Math.min, vals);
  const max = compute(Math.max, vals);

  return range(12).map(month => cloneOptions({}, baseCompareChartOptions, {
      chart: { ...baseCompareChartOptions.chart, height: 200 },
      xAxis: {
        categories: range(25).map(i => i.toString())
      },
      yAxis: {
        title: { text: unitResolution },
        min,
        max
      },
      series: compare.map(item => ({
        data: data && data[item.energySystemId] && data[item.energySystemId]['monthly-hourly'][month],
        type: baseCompareChartType,
        name: projectNamePipe.transform(item.project),
        color: compareColors[item.colorIndex],
        unit: unitResolution,
        showInLegend: false,
      } as SeriesOptions)),
      plotOptions: { spline: { marker: { enabled: false } } }
    }));
}

export type MarkChartDataset = (compareItem: CompareItem, target: Series) => void;

export function compareLegendChartOpts(compare: CompareItem[], projectNames: string[], markChartDataSet: MarkChartDataset): Options {
  return {
    ...baseCompareChartOptions,
    chart: {
      spacing: [0, 0, 0, 0],
      marginTop: 0,
      marginBottom: 0,
      spacingTop: 0,
      height: 80,
      width: 320
    },
    xAxis: { visible: false},
    yAxis: { visible: false},
    legend: {
      padding: 0,
      margin: 0,
      align: 'left',
      verticalAlign: 'middle',
      useHTML: true
    },
    series: projectNames.map((siteName, i) => ({
      type: 'line',
      data: [],
      name: siteName,
      events: {
        legendItemClick: (e: SeriesLegendItemClickEventObject) => {
          const target = ({ ...e.target } as any) as Series;
          markChartDataSet(compare[i], target);
        }
      },
      color: compareColors[compare[i].colorIndex],
    }))
  };
}
