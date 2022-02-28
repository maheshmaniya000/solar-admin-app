import { Options, SeriesOptions } from 'highcharts';

import { cloneOptions, pointFormatter } from 'ng-project/utils/chart.utils';

export const baseCompareChartType = 'spline';

export const baseCompareChartOptions: Options = {
  title: { text: '' },
  exporting: { enabled: false },
  credits: { enabled: false },
  chart: {},
  xAxis: {
    crosshair: true,
    tickWidth: 0,
    tickInterval: 1
  },
  tooltip: {
    headerFormat: '<table>',
    pointFormat: `<tr style="vertical-align: bottom;">
<td style="padding:0;">{series.name}:</td>
<td style="padding:0;text-align:right;"><b>{point.y:.1f}</b></td>
<td style="padding:0;">{series.unit}</td>
</tr>`,
    pointFormatter,
    footerFormat: '</table>',
    shared: true,
    useHTML: true
  },
  plotOptions: {
    line: {
      dataLabels: {
        enabled: true
      },
      enableMouseTracking: false
    },
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      stacking: null
    }
  },
  legend: {
    // padding: 0,
    // margin: 0,
    // align: 'left',
    // verticalAlign: 'middle',
    useHTML: true
  },
};

export function getCompareMonthlyChart(
  series: SeriesOptions[],
  months: string[],
  unitResolution: string,
  yMax?: number,
  yMin?: number
): Options {
  return cloneOptions({}, baseCompareChartOptions, {
    xAxis: { categories: months },
    yAxis: { title: { text: unitResolution }, min: yMin, max: yMax},
    series
  });
}
