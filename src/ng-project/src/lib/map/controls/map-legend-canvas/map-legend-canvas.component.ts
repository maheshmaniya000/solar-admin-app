import { Component, ElementRef, Inject, Input, NgZone, OnChanges, ViewChild } from '@angular/core';

import { Dataset } from '@solargis/dataset-core';
import { UnitToggleSettings } from '@solargis/units';

import { LTA_DATASET } from '../../../project/services/lta-dataset.factory';
import { MapLegendService } from '../../services/map-legend.service';
import { generateMapLegend, legendHeights, legendWidths } from '../../utils/map-legend.utils';

@Component({
  selector: 'sg-map-legend-canvas',
  template: '<canvas #legend [style.width.px]="legendWidth()" [style.height.px]="legendHeight()"></canvas>'
})
export class MapLegendCanvasComponent implements OnChanges {
  @Input() legendUrl: string;
  @Input() dataKey: string;
  @Input() lang: string;
  @Input() unitToggle: UnitToggleSettings;
  @Input() responsive: boolean = true;

  @ViewChild('legend') legendEl: ElementRef<HTMLCanvasElement>;

  constructor(
    private readonly mapLegendService: MapLegendService,
    private readonly ngZone: NgZone,
    @Inject(LTA_DATASET) private readonly ltaDataset: Dataset
  ) {}

  ngOnChanges(): void {
    if (this.legendUrl) {
      this.mapLegendService.getGrassFileLegend(this.legendUrl, this.dataKey)
        .subscribe(grassLegend => {
          this.ngZone.runOutsideAngular(() => { // FIXME seems works the same without ngZone here
            setTimeout(() => {
              if (this.legendEl) {
                this.ngZone.run(() => { // FIXME and here
                  generateMapLegend(
                    this.setupCanvas(this.legendEl.nativeElement),
                    grassLegend,
                    this.ltaDataset.annual.get(this.dataKey),
                    this.unitToggle
                  );
                });
              }
            });
          });
      });
    }
  }

  legendWidth = (): number => legendWidths[this.dataKey] ?? legendWidths.default;

  legendHeight = (): number => legendHeights[this.dataKey] ?? legendHeights.default;

  private setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    if (this.responsive) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = (rect.width || 1) * dpr;
      canvas.height = (rect.height || 1) * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      return ctx;
    } else {
      canvas.width = this.legendWidth();
      canvas.height = this.legendHeight();
      const ctx = canvas.getContext('2d');
      return ctx;
    }
  }
}
