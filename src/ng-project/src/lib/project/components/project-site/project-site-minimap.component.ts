import { Component, OnInit, OnChanges, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-fullscreen';

import { createMapLayer } from '@solargis/leaflet-utils';
import { MapLayerDef } from '@solargis/types/map';
import { Site } from '@solargis/types/site';

@Component({
  selector: 'sg-project-site-minimap',
  encapsulation: ViewEncapsulation.None,
  template: '<div #minimap class="project-site-minimap"></div>',
  styleUrls: ['./project-site-minimap.component.scss']
})
export class ProjectSiteMinimapComponent implements OnInit, OnChanges {
  @Input() site: Site;
  @Input() layerDef: MapLayerDef;

  @ViewChild('minimap', { static: true }) minimap: ElementRef;

  map: any;
  marker: any;

  ngOnInit(): void {
    this.map = L.map(this.minimap.nativeElement, {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false
    });
    new (L.control as any).fullscreen({ position: 'topright' }).addTo(this.map);
    new L.Control.Zoom({ position: 'topright' }).addTo(this.map);

    const icon = L.icon({
        iconUrl: 'assets/img/marker.svg',
        iconSize:     [64, 48],
        iconAnchor:   [32, 48],
    });

    this.marker = L.marker([0, 0], { icon });
    this.marker.addTo(this.map);
    this.map.dragging.disable();

    const [layer] = createMapLayer(this.layerDef);
    this.map.addLayer(layer);

    this.adjustMarker(this.site);
  }

  ngOnChanges(changes): void {
    if (changes.site && changes.site.previousValue) {
      const site: Site = changes.site.currentValue;
      if (site.point) {this.adjustMarker(site);}
    }
  }

  adjustMarker(site: Site): void {
    const latLng = [site.point.lat, site.point.lng] as L.LatLngExpression;
    this.marker.setLatLng(latLng);
    this.map.setView(latLng, 14);
  }
}
