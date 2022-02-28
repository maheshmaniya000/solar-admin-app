import { Component, ElementRef, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Subject } from 'rxjs';
import { auditTime, filter } from 'rxjs/operators';

import { LatLng } from '@solargis/types/site';
import { latlngUnit } from '@solargis/units';

import { MapComponent } from '../components/map.component';
import { CustomControlComponent } from './custom-control.component';

@Component({
  selector: 'sg-map-coordinates',
  template: `
    <mat-card style="padding: 2px 5px">
      <sg-unit-value [unit]="latlngUnit" [value]="mousePosition"></sg-unit-value>
    </mat-card>`
})
export class MapCoordinatesComponent extends CustomControlComponent implements OnInit {

  mousePosition: LatLng;
  latlngUnit = latlngUnit;

  private readonly mousemove$ = new Subject();
  private readonly mouseout$ = new Subject();

  constructor(mapComponent: MapComponent, el: ElementRef) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng.wrap();
      this.mousemove$.next({ lat, lng });
    });

    this.map.on('mouseout', () => {
      this.mouseout$.next();
    });

    this.mousemove$
      .pipe(auditTime(20))
      .subscribe(latlng => {
        this.ensureVisibleCoordinates(latlng);
      });

    this.mouseout$
      .pipe(
        auditTime(20),
        // eslint-disable-next-line no-underscore-dangle
        filter(() => this.control && this.control._map)
      )
      .subscribe(() => this.map.removeControl(this.control));
  }

  private ensureVisibleCoordinates(latlng): void {
    // eslint-disable-next-line no-underscore-dangle
    if (!this.control._map) {
      this.map.addControl(this.control);
    }
    const { lat, lng } = latlng;
    this.mousePosition = { lat, lng };
  }

}
