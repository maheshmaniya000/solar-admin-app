import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';

import { DataLayer, dataLayersToKeyStr } from '@solargis/dataset-core';
import { SystemPvConfig } from '@solargis/types/pv-config';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { exportImageProjectDesc, translateLayersTitle } from 'ng-project/project/utils/export-chart.utils';

import { ExportChartMimeType, ExportChartOpts } from '../../types/export-chart.types';

@Component({
  selector: 'sg-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss']
})
export class HighchartsComponent implements OnChanges, OnDestroy {
  @Input() opts: Highcharts.Options;
  @Input() className;
  @Input() destroyOnChange = false;
  @Input() exportingOpts: ExportChartOpts;
  @Input() reflow = false;

  @ViewChild('chartElm', { static: true }) chartElm: ElementRef;
  @ViewChild('chartElmToExport', { static: true }) chartElmToExport: ElementRef;

  chartObj: Highcharts.Chart;
  exportMimeTypes = ExportChartMimeType;

  constructor(private readonly projectNamePipe: ProjectNamePipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.opts && this.opts) {
      const opts: Highcharts.Options = { ...this.opts };

      // turn off animations
      if (!opts.plotOptions) {opts.plotOptions = {};}
      if (!opts.plotOptions.series) {opts.plotOptions.series = {};}
      opts.plotOptions.series.animation = false;
      if (!opts.chart) {opts.chart = {};}
      opts.chart.animation = false;

      if (!this.chartObj) {
        this.chartObj = Highcharts.chart(this.chartElm.nativeElement, opts);
      } else if (this.destroyOnChange) {
        this.chartObj.destroy();
        this.chartObj = Highcharts.chart(this.chartElm.nativeElement, opts);
      } else {
        this.chartObj.update(opts, true);
        // simple update does not work, we have to replace series - TODO remove, seems it is not required anymore
        // this.chartObj.series.forEach(s => s.remove(false));
        // opts.series.forEach(
        //   s => this.chartObj.addSeries(s, false)
        // );
        // this.chartObj.redraw();
      }
      if (this.reflow) {
        setTimeout(() => this.chartObj?.options && this.chartObj.reflow());
      }
    }
  }

  ngOnDestroy(): void {
    if (this.chartObj) {this.chartObj.destroy();}
  }

  async exportImage(mimeType: ExportChartMimeType): Promise<void> {
    await import('highcharts/modules/exporting').then(module => (module as any).default(Highcharts));
    await import('highcharts/modules/offline-exporting').then(module => (module as any).default(Highcharts));

    const year = (new Date()).getFullYear();
    const layers = this.exportingOpts?.layers;
    const isLayersArray = Array.isArray(layers);
    const title = translateLayersTitle(layers);

    const descLineHeight = 15;
    const bottomSpacing = 20;
    const leftMargin = 15;

    const color = '#666666';
    const fontSize = '10px';

    const yAxis = Array.isArray(this.opts.yAxis)
      ? this.opts.yAxis.map(axis => ({ ...axis, labels: { enabled: true } }))
      : { ...this.opts.yAxis, labels: { enabled: true } };

    const opts: Highcharts.Options = {
      ...this.opts,
      title: { text: title, style: { fontWeight: 'bold', color, fontSize: '16px' } },
      chart: { ...this.opts.chart,
        spacingBottom: bottomSpacing + (this.exportingOpts?.compare ? (this.exportingOpts.compare.length - 1) * descLineHeight : 0),
        events: {
          load: e => {
            if (this.exportingOpts?.single) {
              const chart = e.target as any;
              const projectDesc = exportImageProjectDesc(
                this.exportingOpts.single.projectName,
                layers,
                this.exportingOpts?.single.pvConfig as SystemPvConfig
              );

              chart.renderer
                .text(projectDesc, leftMargin, chart.spacingBox.height + descLineHeight + (bottomSpacing / 2))
                .css({ fontSize, color })
                .add();
            }

            if (this.exportingOpts?.compare) {
              const chart = e.target as any;

              this.exportingOpts.compare.forEach((compare, i) => {
                const projectDesc = exportImageProjectDesc(
                  this.projectNamePipe.transform(compare.project),
                  this.exportingOpts?.layers,
                  compare.energySystem?.pvConfig as SystemPvConfig
                );
                chart.renderer
                  .text(projectDesc, leftMargin, chart.spacingBox.height + (descLineHeight * (i + 1)) + (bottomSpacing / 2))
                  .css({ fontSize, color })
                  .add();
              });
            }

          }
        },
      },
      yAxis,
      credits: { enabled: true, text: `© ${year} Solargis`, style: { fontSize, color } },
    };

    if (isLayersArray && (layers as DataLayer[]).length > 1) {
      opts.series = opts.series.map(s => ({ ...s, showInLegend: true }));
      opts.legend = { useHTML: true };
    }

    const chartToExportObj = Highcharts.chart(this.chartElmToExport.nativeElement, opts);
    const layerKeys = dataLayersToKeyStr(layers);
    chartToExportObj.exportChartLocal({
      filename: `Solargis_Chart_${this.exportingOpts?.single?.projectName || 'Export'}_${layerKeys}`,
      type: mimeType,
      allowHTML: true,
    });
  }

}
