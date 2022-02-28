import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges
} from '@angular/core';
import { Options } from 'highcharts';

import { DataLayer } from '@solargis/dataset-core';
import { DataStats } from '@solargis/types/dataset';

import { getChartColors, getChartType } from '../../../utils/chart.utils';

type MinichartRenderer = 'native' | 'highcharts';

const minichartBaseOpts = {
  title: false,
  subtitle: false,
  exporting: { enabled: false },
  credits: { enabled: false },
  xAxis: { visible: false },
  yAxis: { visible: false, startOnTick: false, endOnTick: false },
  legend: { enabled: false },
  tooltip: { enabled: false },
  plotOptions: { series: { animation: false, enableMouseTracking: false } }
};

const minichartOpts = {
  column: {
    ...minichartBaseOpts,
    chart: { margin: 0 },
    plotOptions: {
      ...minichartBaseOpts.plotOptions,
      column: { pointPadding: 0, groupPadding: 0 }
    }
  },
  line: {
    ...minichartBaseOpts,
    chart: { margin: 2 },
    plotOptions: {
      ...minichartBaseOpts.plotOptions,
      line: { marker: { enabled: true, radius: 2 } }
    }
  }
};

@Component({
  selector: 'sg-monthly-minichart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./monthly-minichart.component.scss'],
  templateUrl: './monthly-minichart.component.html'
})
export class MonthlyMinichartComponent implements OnChanges, AfterViewInit {

  @Input() layer: DataLayer;
  @Input() data: number[];
  @Input() dataStats: DataStats;

  @Input() width: number;
  @Input() height: number;

  @Input() renderer: MinichartRenderer = 'highcharts';

  color: string;

  percentValues: number[];
  minichartOpts: Options;

  private readonly elm;

  constructor(el: ElementRef, private readonly ref: ChangeDetectorRef) { this.elm = el.nativeElement; }

  ngAfterViewInit(): void {
    setTimeout(() => { if (!this.minichartOpts) {this.updateMinichart();} });
  }

  ngOnChanges(): void {
    const { offsetWidth, offsetHeight } = this.elm;
    if (offsetWidth && offsetHeight) {this.updateMinichart();}
  }

  updateMinichart(): void {
    this.color = getChartColors(this.layer)[0];

    if (this.renderer === 'highcharts') {
      const chartType = getChartType(this.layer);

      this.minichartOpts = {
        ...minichartOpts[chartType],
        colors: [this.color],
        series: [{
          type: chartType,
          data: this.data
        }]
      } as Options;

      // update width, height
      this.minichartOpts.chart.width = this.width || this.elm.offsetWidth;
      this.minichartOpts.chart.height = this.height || this.elm.offsetHeight;
      this.ref.markForCheck();

    } else { // native renderer
      const { min, max } = this.dataStats || {
        min: Math.min(0, ...this.data),
        max: Math.max(...this.data)
      };
      this.percentValues = this.data.map(v => (v - min) * 100 / (max - min));
    }
  }

}

