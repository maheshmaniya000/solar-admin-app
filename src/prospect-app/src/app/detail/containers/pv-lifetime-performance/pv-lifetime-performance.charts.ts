import { Options, SeriesOptions } from 'highcharts';

import { pointFormatter } from 'ng-project/utils/chart.utils';

interface IndividualSeriesOptionsExt extends SeriesOptions {
  type: any;
  data?: any;
  unit?: string;
  formatter?: (value: number) => string;
}
interface OptionsExt extends Options {
  series?: IndividualSeriesOptionsExt[];
}

export const performanceRatioChart = (data: number[],
                                    unit?: string,
                                    formatter?: (value: number) => string,
                                    yearStr?: string): OptionsExt => ({
  title: { text: '' },
  colors: ['#67BCF0'],
  exporting: { enabled: false },
  legend: { enabled: false },
  xAxis: {
    // @ts-ignore
    title: { text: yearStr ? `<b>[${yearStr}]</b>` : '', useHTML: !!yearStr },
    min: 0,
    max: 25,
    tickInterval: 5,
    crosshair: true
  },
  yAxis: {
    min: 0,
    max: 100,
    tickInterval: 10,
    title: { text: '' },
    labels: {
      format: '{value}' + (unit || '')
    }
  },
  tooltip: {
    headerFormat: '<table>',
    pointFormat: `<tr style="vertical-align: bottom;">
<td style="padding: 0;"><b style="text-align: right;">{point.y:.1f}</b></td>
<td style="padding: 0;">{series.unit}</td>
</tr>`,
    footerFormat: '</table>',
    pointFormatter,
    shared: true,
    useHTML: true
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
    spline: {
      marker: {
        enabled: false
      }
    }
  },
  credits: { enabled: false },
  series: [{
    type: 'line',
    data,
    name: '',
    formatter,
    unit: unit || ''
  }]
});

export const pvYieldChart = (data: number[],
                           average: number,
                           unit?: string,
                           formatter?: (value: number) => string,
                           yearStr?: string): OptionsExt => ({
  title: { text: '' },
  colors: [ '#67BCF0' ],
  exporting: { enabled: false },
  legend: { enabled: false },
  xAxis: {
    // @ts-ignore
    title: { text: yearStr ? `<b>[${yearStr}]</b>` : '', useHTML: !!yearStr },
    min: 0,
    max: 25,
    tickInterval: 5,
    crosshair: true,
  },
  yAxis: {
    min: 0,
    // @ts-ignore
    title: { text: unit ? `<b>[${unit}]</b>` : '', useHTML: !!unit },
    plotLines: [{
      color: 'red',
      value: average,
      dashStyle: 'ShortDash',
      width: 2,
      zIndex: 6,
      label: { text: 'Average', align: 'right', style: { color: 'red' }}
    }]
  },
  tooltip: {
    headerFormat: '<table>',
    pointFormat: `<tr style="vertical-align: bottom;">
<td style="padding: 0;"><b style="text-align: right;">{point.y:.1f}</b></td>
<td style="padding: 0;">{series.unit}</td>
</tr>`,
    footerFormat: '</table>',
    pointFormatter,
    shared: true,
    useHTML: true
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
    spline: {
      marker: {
        enabled: false
      }
    }
  },
  credits: { enabled: false },
  series: [{
    type: 'areaspline',
    data,
    name: '',
    formatter,
    unit: unit || ''
  }]
});
