import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';

import { isStaticMapSupported, MapLayerDef, StaticMapSize, staticMapUrl } from '@solargis/types/map';
import { LatLng, LatLngZoom, Site } from '@solargis/types/site';

@Component({
  selector: 'sg-site-location-map',
  templateUrl: './site-location-map.component.html',
  styleUrls: ['./site-location-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteLocationMapComponent implements OnInit {
  imgSrc: string;
  reportMapPoint: LatLng;
  reportMapCountryCode: string;

  @Input() site: Site;
  @Input() layerDef: MapLayerDef;
  @Input() pvElectricity = true;
  @Input() satellite = false;
  @Input() point: LatLng;
  @Input() countryCode: string;

  constructor(@Inject('Window') private readonly window: Window) {}

  ngOnInit(): void {
    if ((this.site && this.site.point) || this.point) {
      this.loadImage();
    }
  }

  loadImage(): void {
    if (this.satellite && isStaticMapSupported(this.layerDef)) {
      const center: LatLngZoom = { ...this.site.point, zoom: 16 };
      const size: StaticMapSize = {
        width: 800,
        height: 800,
        devicePixelRatio: this.window.devicePixelRatio
      };
      this.imgSrc = staticMapUrl(this.layerDef, center, size);
    } else {
      this.reportMapPoint = this.site?.point || this.point;
      this.reportMapCountryCode = this.site?.place?.placemark?.countryCode || this.countryCode;
    }
  }
}
