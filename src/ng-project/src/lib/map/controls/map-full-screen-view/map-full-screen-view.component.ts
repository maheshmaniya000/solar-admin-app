import { Component, ElementRef, OnInit } from '@angular/core';

import { MapComponent } from 'ng-project/map/components/map.component';

import { CustomControlComponent } from '../custom-control.component';
@Component({
  selector: 'sg-map-full-screen-view',
  templateUrl: './map-full-screen-view.component.html',
  styleUrls: ['./map-full-screen-view.component.scss']
})
export class MapFullScreenViewComponent extends CustomControlComponent implements OnInit {
  isFullscreen: boolean = false;

  constructor(mapComponent: MapComponent, el: ElementRef) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.map.addControl(this.control);

    this.map.on('fullscreenchange', () => {
      this.isFullscreen = (this.map as any).isFullscreen();
    });
  }

  toggleFullscreen(): void {
    (this.map as any).toggleFullscreen();
  }

}
