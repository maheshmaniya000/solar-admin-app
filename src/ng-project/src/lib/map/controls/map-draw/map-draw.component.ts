import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { MapComponent } from '../../components/map.component';
import { MapDrawModeChange } from '../../map.actions';
import { MapDrawMode, State } from '../../map.reducer';
import { CustomControlComponent } from '../custom-control.component';

@Component({
  selector: 'sg-map-draw',
  templateUrl: './map-draw.component.html',
  styleUrls: ['./map-draw.component.scss']
})
export class MapDrawComponent extends CustomControlComponent implements OnInit {
  drawMode$: Observable<MapDrawMode>;

  constructor(mapComponent: MapComponent, el: ElementRef, private readonly store: Store<State>) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.map.addControl(this.control);
    this.drawMode$ = this.store.select('map', 'drawMode')
      .pipe(
        distinctUntilChanged()
      );
  }

  onSelectionModeChange(id: MapDrawMode): void {
    this.store.dispatch(new MapDrawModeChange(id));
  }

}
