import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { isLabelsAvailable, MapLayerDef, MapLayerDefWithAccess, MapSelectedLayers } from '@solargis/types/map';

import { LayoutMapPreviewsToggle } from 'ng-shared/core/actions/layout.actions';

import { MapMarkersToggle, MapSelectedLabels, MapSelectedLayerId } from '../../map.actions';
import { State } from '../../map.reducer';
import { selectMapLayersWithAccess } from '../../selectors';

@Component({
  selector: 'sg-map-selector-dialog',
  styleUrls: ['./map-selector-dialog.component.scss'],
  templateUrl: './map-selector-dialog.component.html'
})
export class MapSelectorDialogComponent implements OnInit {

  mapboxLayerDefs$: Observable<MapLayerDefWithAccess[]>;
  layerDefs$: Observable<MapLayerDefWithAccess[]>;
  labelsDef$: Observable<MapLayerDef>;

  selected$: Observable<MapSelectedLayers>;
  labelsAvailable$: Observable<boolean>;

  showLargeMarkers$: Observable<boolean>;

  previewsVisible$: Observable<boolean>;

  constructor(
    private readonly store: Store<State>,
    public dialogRef: MatDialogRef<MapSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const layers$ = this.store.pipe(selectMapLayersWithAccess);

    this.showLargeMarkers$ = this.store.select('map', 'showLargeMarkers');

    this.mapboxLayerDefs$ = layers$.pipe(
      map((layers: MapLayerDefWithAccess[]) =>
        layers.filter(layer => layer.labels !== true && !layer._id.startsWith('solargis'))
      )
    );

    this.layerDefs$ = layers$.pipe(
      map((layers: MapLayerDefWithAccess[]) =>
        layers.filter(layer => layer.labels !== true && layer._id.startsWith('solargis'))
      )
    );

    this.labelsDef$ = layers$.pipe(
      map((layers: MapLayerDef[]) => layers.find(layer => layer.labels === true))
    );

    this.selected$ = this.store.select('map', 'selected');

    this.labelsAvailable$ = combineLatest(
      this.selected$.pipe(distinctUntilChanged((sel1, sel2) => isEqual(sel1, sel2))),
      layers$
    ).pipe(
      map(([selected, layerDefs]) => layerDefs.find(layer => layer._id === selected.layerId)),
      map(layer => isLabelsAvailable(layer))
    );

    this.previewsVisible$ = this.store.select('layout', 'mapPreviews');
  }

  selectLayer(layer: MapLayerDefWithAccess): void {
    if (layer.accessGranted) {
      this.store.dispatch(new MapSelectedLayerId(layer._id));
      this.dialogRef.close();
    }
  }

  selectLabels(labels: boolean): void {
    this.store.dispatch(new MapSelectedLabels(labels));
  }

  selectMarkers(markers: boolean): void {
    this.store.dispatch(new MapMarkersToggle(markers));
  }

  switchView(): void {
    this.store.dispatch(new LayoutMapPreviewsToggle());
  }
}
