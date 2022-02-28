import {
  Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';

import { MapLayerDef } from '@solargis/types/map';

import { MapSelectorDialogComponent } from 'ng-project/map/components/map-selector-dialog/map-selector-dialog.component';

import { satelliteMapLayerId, streetsMapLayerId } from '../../../utils/map.constants';
import { MapComponent } from '../../components/map.component';
import { MapSelectedLayerId } from '../../map.actions';
import { State } from '../../map.reducer';
import { CustomControlComponent } from '../custom-control.component';

@Component({
  selector: 'sg-map-menu',
  encapsulation: ViewEncapsulation.None, // otherwise .mat styles doesn't work
  styleUrls: ['./map-menu.component.scss'],
  templateUrl: './map-menu.component.html'
})
export class MapMenuComponent extends CustomControlComponent implements OnInit, OnChanges {

  @Input() layers: MapLayerDef[];
  @Input() layerId: string;

  currentLayerDef: MapLayerDef;
  satelliteLayer: MapLayerDef;
  streetLayer: MapLayerDef;

  openMapSelectorVisible: boolean = true;

  satelliteMapLayerId = satelliteMapLayerId;

  constructor(
    mapComponent: MapComponent,
    el: ElementRef,
    private readonly dialog: MatDialog,
    private readonly store: Store<State>
  ) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.map.addControl(this.control);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.layers) {
      const layers = changes.layers.currentValue;
      this.satelliteLayer = layers.find(l => l._id === satelliteMapLayerId);
      this.streetLayer = layers.find(l => l._id === streetsMapLayerId);
    }
    if (changes.layers || changes.layerId) {
      this.currentLayerDef = this.layers.find(l => l._id === this.layerId);
    }
  }

  openMapSelectorDialog(): void {
    const { lat, lng } = this.map.getCenter();
    this.dialog.open(MapSelectorDialogComponent, {
      data: {
        center: { lat, lng },
        zoom: 2
      }
    });
  }

  quickSwitchLayer(): void {
    const newLayerId = (this.currentLayerDef._id === satelliteMapLayerId)
      ? streetsMapLayerId
      : satelliteMapLayerId;
    this.store.dispatch(new MapSelectedLayerId(newLayerId));
  }

  @HostListener('document:fullscreenchange')
  onScreenChange(): void {
    this.openMapSelectorVisible = isNil(document.fullscreenElement);
  }
}
