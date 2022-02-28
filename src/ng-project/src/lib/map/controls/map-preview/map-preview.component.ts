import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import * as L from 'leaflet';

import { getElementRect } from '@solargis/leaflet-utils';

import { MapComponent } from '../../components/map.component';
import { CustomControlComponent } from '../custom-control.component';

@Component({
  selector: 'sg-map-preview',
  styleUrls: ['./map-preview.component.scss'],
  templateUrl: './map-preview.component.html'
})
export class MapPreviewComponent extends CustomControlComponent implements AfterViewInit, OnInit {

  @ViewChild('minimap', { static: true }) minimapElm: ElementRef;

  minimapOffset: [number, number];
  mouseover = false;

  constructor(mapComponent: MapComponent, el: ElementRef) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.map.addControl(this.control);
  }

  ngAfterViewInit(): void {
    const minimap = L.map(this.minimapElm.nativeElement, {
      attributionControl: false,
      zoomControl: false,
      scrollWheelZoom: false,
      worldCopyJump: true
    } as L.MapOptions);

    const sgUrl = 'http://{s}.static.solargis.com/{id}/{z}/{segX}_{segY}/z{z}_{x}x{y}.jpg';
    const sgAttrib = `iMaps © 2016 Solargis <a href="http://solargis.com" target="_blank">Data</a> © 2016 Solargis`;

    const ghi = L.tileLayer(sgUrl, {
      id: 'ghi_yr_avg',
      subdomains: ['tiles1', 'tiles2', 'tiles3'],
      minZoom: 3,
      maxZoom: 11,
      maxNativeZoom: 11,
      segX(coord) {
        return Math.floor(coord.x / 32);
      },
      segY(coord) {
        return Math.floor(coord.y / 32);
      },
      attribution: sgAttrib
    } as L.TileLayerOptions); // segX and segY not type-safe

    minimap.addLayer(ghi);

    this.updateMinimapOffset();

    const updateMinimap = (): void => {
      const minimapCenter = this.map.containerPointToLatLng(this.minimapOffset);
      minimap.setView(minimapCenter, this.map.getZoom(), { animate: false });
    };

    updateMinimap();

    this.map.on('zoom', () => updateMinimap());
    this.map.on('move', () => updateMinimap());
    this.map.on('moveend', () => updateMinimap());
  }

  @HostListener('mouseenter', ['$event'])
  onMouseOver(): void {
    this.mouseover = true;
  }

  @HostListener('mouseleave', ['$event'])
  onMouseOut(): void {
    this.mouseover = false;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateMinimapOffset();
  }

  updateMinimapOffset(): void {
    const minimapNE = this.minimapElm.nativeElement;

    const minimapCenterOffset = {
      left: minimapNE.offsetWidth / 2,
      top: minimapNE.offsetHeight / 2
    };

    const minimapOffset = getElementRect(this.minimapElm.nativeElement);
    const mapOffset = getElementRect(this.map.getContainer());

    this.minimapOffset = [
      minimapOffset.left - mapOffset.left + minimapCenterOffset.left,
      minimapOffset.top - mapOffset.top + minimapCenterOffset.top
    ];

  }
}
