import { Input, ElementRef, OnInit, Directive } from '@angular/core';
import * as L from 'leaflet';

import { MapComponent } from '../components/map.component';

@Directive()
export class CustomControlComponent implements OnInit {

  @Input()
  protected position = 'topright';

  protected map: L.Map;
  protected control;

  constructor(protected mapComponent: MapComponent, protected el: ElementRef) {}

  ngOnInit(): void {
    this.map = this.mapComponent.map;
    const element = this.el.nativeElement;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    const customControl = L.Control.extend({
      options: {
        position: this.position
      },
      initialize(options) {
        L.Util.setOptions(this, options);
      },
      onAdd() {
        L.DomEvent.disableClickPropagation(element);
        (that as any).disableEventPropagation('mousemove');
        return element;
      }
    });

    this.control = new customControl();
  }

  disableEventPropagation(eventName, elm): void {
    L.DomEvent.on(elm || this.el.nativeElement, eventName, L.DomEvent.stop);
  }

}

