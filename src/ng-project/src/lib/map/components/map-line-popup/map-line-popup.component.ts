import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';

import { units } from '@solargis/units';

@Component({
  selector: 'sg-map-line-popup',
  styleUrls: ['./map-line-popup.component.scss'],
  templateUrl: './map-line-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapLinePopupComponent implements OnInit {
  distance: number;
  color: any;
  unit = units.km;

  @Input() layer: L.Layer = null;
  @Output() deleteLine: EventEmitter<L.Layer> = new EventEmitter<L.Layer>();
  @Output() changeColor: EventEmitter<{id: number; color: string}> = new EventEmitter<{id: number; color: string}>();

  ngOnInit(): void {
    // eslint-disable-next-line no-underscore-dangle
    const [from, to] = (this.layer as any)._latlngs;
    this.distance = from.distanceTo(to) / 1000;
  }

  onChangeColor(color: any): void {
    // eslint-disable-next-line no-underscore-dangle
    const id = (this.layer as any)._leaflet_id;
    this.changeColor.emit({ id, color });
  }
}
