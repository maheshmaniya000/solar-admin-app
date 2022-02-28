import { dateFormat, numberFormat, Options, SeriesOptions } from 'highcharts';

import { DataLayer } from '@solargis/dataset-core';
import { DataChartType, DataStats } from '@solargis/types/dataset';
import { ensureArray, range } from '@solargis/types/utils';


function formatValue(format: string, value: any, formatter?: (val: number) => string): any {
  if (value === null) {return '';}
  if (typeof value !== 'number' && value instanceof Date === false) {return value;}
  let m;
  return format ? ((m = format.match(/(,)?\.(\d*)f$/))) ? formatter ?
    formatter(value) :
    numberFormat(value, parseInt(m[2] || '0', 10), undefined, m[1] ? undefined : '') :
    dateFormat(format, value) :
    value;
}

function resolvePath(path: string[], target: any): any {
  while (path.length && target) {
    if (Object.prototype.hasOwnProperty.call(target, path[0])) {target = target[path.shift()];}
    else if (target.userOptions && Object.prototype.hasOwnProperty.call(target.userOptions, path[0])) {
      target = target.userOptions[path.shift()];
    }
    else {break;}
  }
  if (!path.length) {return target;}
}

export function getChartColors(layer: DataLayer | DataLayer[]): string[] {
  const layers = ensureArray(layer);
  return layers.map(l => l.chart ? l.chart.color : '#999999');
}

/** Maps graph label. Example PVOUT_total => 'PVOUT total' */
export function layerKeyToGraphLabel(key: string): string {
  return key.replace('_', ' ');
}

export function getChartType(layer: DataLayer): DataChartType {
  if (!layer) {return undefined;}
  return layer.chart ? layer.chart.type || 'column' : 'column';
}

export function pointFormatter(...args): string {
  return args[0].replace(/{([^:}]+)(:([^}]*))?}/g, (m0, prop, m2, propFormat) => {
    const path = prop.split(/\./g);
    if (path.length) {switch (path.shift()) {
      case 'point': return formatValue(propFormat, resolvePath(path, this), this.series.userOptions.formatter);
      case 'series': return formatValue(propFormat, resolvePath(path, this.series));
    }}
    return m0;
  });
}

export const baseHighchartsOptions: Partial<Options> = {
  chart: { height: 320 },
  title: { text: '' },
  colors: ['black'],
  exporting: { enabled: false },
  xAxis: {
    crosshair: true,
    tickWidth: 0,
    tickInterval: 1
  },
  yAxis: {
    title: { text: '' },
    // labels: { enabled: false },
    // tickInterval: 1
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
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      stacking: null
    }
  },
  credits: { enabled: false },
};

const isa = (data: any): boolean => Array.isArray(data);
const iso = (data: any): boolean => typeof data === 'object' && data !== null;

export function cloneOptions(target, ...sources): any {
  sources.forEach(source => {
    if (source === undefined) {return;}
    else if (isa(source)) {
      if (isa(target)) {for (let i = 0; i < source.length; i++) {target[i] = cloneOptions(target[i], source[i]);}}
      else if (iso(target)) {target = source.map(src => cloneOptions({}, target, src));}
      else {target = source.map(res => cloneOptions(undefined, res));}
    } else if (iso(source)) {
      if (!iso(target) || isa(target)) {target = {};}
      for (const k in source) {if (Object.prototype.hasOwnProperty.call(source, k)) {target[k] = cloneOptions(target[k], source[k]);}}
    } else {target = source;}
  });
  return target;
}

export function monthlyChartOpts(
  months: string[],
  layer: DataLayer | DataLayer[],
  data: { [key: string]: number[] },
  unitLabels: string | string[] | { [p: string]: string },
  formatter: (value: number, layerKey?: string) => string,
  minMax?: { min: number; max: number },
  showInLegend = true
): Highcharts.Options {

  const layers = ensureArray(layer);
  if (typeof unitLabels === 'string') {
    unitLabels = [ unitLabels ];
  }
  const layerKeys = layers.map(l => l.key);
  if (Array.isArray(unitLabels)) {
    unitLabels = layerKeys.reduce((map, k, i) => ({ ...map, [k]: unitLabels[i] }), {});
  }

  const { yAxis, units } = layerKeys.reduce((ctx, key) => {
    if (ctx.units.indexOf(key = unitLabels[key]) < 0) {
      ctx.yAxis.push({
        opposite: !!ctx.yAxis.length,
        title: { text: key ? `<b>[${key}]</b>` : '', useHTML: true },
        ...(minMax || {})
      });
      ctx.units.push(key);
    }
    return ctx;
  }, { yAxis: [], units: [] });

  const opts = cloneOptions({}, baseHighchartsOptions, {
    chart: { height: 320 },
    xAxis: { categories: months },
    yAxis,
    colors: getChartColors(layers),
    series: layers.map(layerItem => ({
      name: layerKeyToGraphLabel(layerItem.key),
      showInLegend: showInLegend && layers.length > 1,
      unit: unitLabels[layerItem.key],
      formatter: formatter ? (val => formatter(val, layerItem.key)) : undefined,
      data: data[layerItem.key],
      type: getChartType(layerItem),
      yAxis: units.indexOf(unitLabels[layerItem.key])
    }))
  } as Options);
  // if (layers.length > yAxis.length) opts.plotOptions.column.stacking = 'normal';
  return opts;
}

export function hourlyChartOpts(
  layers: DataLayer[],
  data: number[][],
  extremes: DataStats | DataStats[],
  unitLabels: { [key: string]: string },
  formatter: (value: number, layerKey?: string) => string
): Options {
  // add 24h ticker to data
  data = data.map(row => [...row, row[0]]);

  return cloneOptions({}, baseHighchartsOptions, {
    chart: { height: 200 },
    xAxis: { categories: range(25) },
    yAxis: { ...extremes},
    colors: getChartColors(layers),
    series: data.map((x, i) => ({
      data: x,
      type: 'spline',
      name: layerKeyToGraphLabel(layers[i].key),
      showInLegend: false,
      unit: unitLabels && unitLabels[layers[i].key] || '',
      formatter: formatter ? (val => formatter(val, layers[i].key)) : undefined
    } as SeriesOptions)),
    plotOptions: { spline: { marker: { enabled: false } } }
  });
}

export function oppositeHourlyChartOpts(
  layers: [DataLayer, DataLayer],
  data: number[][],
  extremes: DataStats[],
  unitLabels: { [key: string]: string },
  formatter: (value: number, layerKey?: string) => string
): Options {
  // add 24h ticker to data
  data = data.map(row => [...row, row[0]]);

  const yAxis = extremes.map((extreme, i) => ({ ...baseHighchartsOptions.yAxis, ...extreme, opposite: i % 2 === 1 }));

  return cloneOptions({}, baseHighchartsOptions, {
    chart: { height: 200 },
    xAxis: { ...baseHighchartsOptions.xAxis, categories: range(25) },
    yAxis,
    colors: getChartColors(layers),
    series: data.map((x, i) => ({
      data: x,
      type: 'spline',
      name: layerKeyToGraphLabel(layers[i].key),
      showInLegend: false,
      yAxis: i % 2,
      unit: unitLabels && unitLabels[layers[i].key] || '',
      formatter: formatter ? (val => formatter(val, layers[i].key)) : undefined
    } as SeriesOptions)),
    plotOptions: { spline: { marker: { enabled: false}}}
  });
}

export function legendChartOpts(layers: DataLayer[], unitLabels: { [p: string]: string }): Options {
  return cloneOptions({}, baseHighchartsOptions, {
    chart: {
      spacing: [0, 0, 0, 0],
      marginTop: 0,
      marginBottom: 0,
      spacingTop: 0,
      height: 40,
      width: 640
    },
    colors: getChartColors(layers),
    xAxis: { visible: false},
    yAxis: { visible: false},
    legend: {
      padding: 0,
      margin: 0,
      align: 'left',
      verticalAlign: 'middle',
      useHTML: true
    },
    series: layers.map(({ key }) => ({
      data: [],
      type: 'line',
      name: layerKeyToGraphLabel(unitLabels[key] ? `${key} [${unitLabels[key]}]` : key),
      events: {
        legendItemClick: e => { e.preventDefault(); }
      }
    } as SeriesOptions))
  });
}


