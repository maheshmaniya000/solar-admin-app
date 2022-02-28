import { Component, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { MapLayerDef } from '@solargis/types/map';
import { replaceAll } from '@solargis/types/utils';
import { UnitToggleSettings } from '@solargis/units';

import { LayoutMapLegendToggle } from 'ng-shared/core/actions/layout.actions';
import { OpenedClosedState } from 'ng-shared/core/reducers/layout.reducer';
import { selectSelectedLang, selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';

import { MapComponent } from '../../components/map.component';
import { State } from '../../map.reducer';
import { CustomControlComponent } from '../custom-control.component';

@Component({
  selector: 'sg-map-legend',
  styleUrls: ['./map-legend.component.scss'],
  templateUrl: './map-legend.component.html',
})
export class MapLegendComponent extends CustomControlComponent implements OnInit, OnChanges {
  @Input() layers: MapLayerDef[];
  @Input() layerId: string;

  layer: MapLayerDef;
  legendUrl: string;

  legendOpened$: Observable<boolean>;
  unitToggle$: Observable<UnitToggleSettings>;
  selectedLang$: Observable<string>;

  constructor(mapComponent: MapComponent, el: ElementRef, private readonly store: Store<State>) {
    super(mapComponent, el);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.map.addControl(this.control);
    this.legendOpened$ = this.store.select('layout').pipe(
      map(layout => layout.mapLegend === 'opened'),
      distinctUntilChanged()
    );

    this.unitToggle$ = this.store.pipe(selectUnitToggle);
    this.selectedLang$ = this.store.pipe(selectSelectedLang);
  }

  ngOnChanges(): void {
    this.legendUrl = undefined;
    this.layer = undefined;

    if (this.layers && this.layerId) {
      this.layer = this.layers.find(l => l._id === this.layerId);
      if (this.layer?.legendTemplate) {
        this.legendUrl = replaceAll(this.layer.legendTemplate, this.layer.options);
      }
    }
  }

  toggleLegend(toggle: OpenedClosedState): void {
    this.store.dispatch(new LayoutMapLegendToggle(toggle));
  }

}
