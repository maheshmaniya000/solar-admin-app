import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';

import { createMapLayer } from '@solargis/leaflet-utils';
import { MapLayerDef, hasLabelsAlternative, isLabelsAvailable } from '@solargis/types/map';

import { MapSelectorDialogComponent } from './map-selector-dialog.component';


@Component({
  selector: 'sg-map-selector-preview',
  styleUrls: ['./map-selector-preview.component.scss'],
  template: '<div #minimap></div>'
})
export class MapSelectorPreviewComponent implements AfterViewInit, OnChanges {
  @Input() layerDef: MapLayerDef;
  @Input() labelsDef: MapLayerDef;
  @Input() labels: boolean;

  @ViewChild('minimap', { static: true }) minimapElm: ElementRef;

  mapLayer: L.TileLayer;
  mapLayerAlt: L.TileLayer;
  mapLabels: L.TileLayer;

  minimap: L.Map;

  labelsAvailable: boolean;
  labelsAlternative: boolean;

  constructor(private readonly mapSelector: MapSelectorDialogComponent) {
  }

  ngAfterViewInit(): void {
    this.minimap = L.map(this.minimapElm.nativeElement, {
      attributionControl: false,
      dragging: false,
      doubleClickZoom: false,
      zoomControl: false,
      scrollWheelZoom: false,
      worldCopyJump: true
    });

    const { center, zoom } = this.mapSelector.data;

    this.minimap.setView(center, zoom);

    [this.mapLayer, this.mapLayerAlt] = createMapLayer(this.layerDef);
    this.minimap.addLayer(this.mapLayer);

    this.labelsAvailable = isLabelsAvailable(this.layerDef);
    this.labelsAlternative = hasLabelsAlternative(this.layerDef);

    this.applySelectedLabels(false);

    setTimeout(() => this.minimap.invalidateSize());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.labels) {this.applySelectedLabels(changes.labels.firstChange);}
  }

  private getMapLayer(labels: boolean): L.TileLayer {
    return labels && this.labelsAlternative ? this.mapLayerAlt : this.mapLayer;
  }

  // simplified logic from map.component
  private applySelectedLabels(firstChange: boolean): void {
    if (!this.minimap || !this.labelsAvailable) {return;}

    if (!this.mapLabels) {
      [this.mapLabels] = createMapLayer(this.labelsDef);
    }

    if (!firstChange) {
      const prevLayer = this.getMapLayer(!this.labels);
      // remove alternative base map
      if (this.labelsAlternative && this.minimap.hasLayer(prevLayer)) {
        this.minimap.removeLayer(prevLayer);
      }
    }
    // handle base map
    const nextLayer = this.getMapLayer(this.labels);
    if (!this.minimap.hasLayer(nextLayer)) {
      this.minimap.addLayer(nextLayer);
    }

    // handle labels
    if ((this.labelsAlternative || !this.labels) && this.minimap.hasLayer(this.mapLabels)) {
      this.minimap.removeLayer(this.mapLabels);
    }
    if (!this.labelsAlternative && this.labels && !this.minimap.hasLayer(this.mapLabels)) {
      this.minimap.addLayer(this.mapLabels);
    }
  }

}
