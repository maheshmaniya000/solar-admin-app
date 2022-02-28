import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { defer, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { MapLayerDefWithAccess, MapSelectedLayers } from '@solargis/types/map';
import { centerFromUrlParam, centerToUrlParam } from '@solargis/types/site';
import { toBoolean } from '@solargis/types/utils';

import { MapConfig, ProspectAppConfig } from 'ng-shared/config';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { LayoutMapLegendToggle } from 'ng-shared/core/actions/layout.actions';
import { UrlParamsSync } from 'ng-shared/core/actions/url-params.actions';
import { urlParamsInit$ } from 'ng-shared/core/effects/url-params.effects';

import { MAP_LEGEND_BREAKPOINT } from '../components/map.breakpoint';
import {
  MapCenter, MapCenterMoveEnd, MapDrawModeChange, MapLayersFromConfig, MapSelectedDefaultLayerId,
  MapSelectedFromUrl, MAP_CENTER_MOVE_END, MAP_SELECTED_DEFAULT_LAYER_ID, MAP_SELECTED_FROM_URL, MAP_SELECTED_LABELS, MAP_SELECTED_LAYER_ID
} from '../map.actions';
import { State } from '../map.reducer';
import { selectMapLayersWithAccess } from '../selectors';

@Injectable()
export class MapEffects {

  private readonly defaults: MapConfig;

  @Effect()
  initLayersDefer$ = defer(() => {
    const layers = this.config.map.layers;
    return of(new MapLayersFromConfig(layers));
  });

  @Effect()
  initDrawMode$ = defer(() => of(new MapDrawModeChange('site')));

  @Effect()
  centerToUrl$ = this.actions$.pipe(
    ofType<MapCenterMoveEnd>(MAP_CENTER_MOVE_END),
    map(action => action.payload),
    map(center => centerToUrlParam(center)),
    filter(c => c !== this.lastCenterFromUrl), // check internal state
    map(c => new UrlParamsSync({ c }))
  );

  @Effect()
  centerFromUrl$ = urlParamsInit$(this.store, this.actions$).pipe(
    map(params => params.c),
    filter(x => !!x),
    map(c => this.lastCenterFromUrl = c), // store inner state
    map(c => centerFromUrlParam(c)),
    distinctUntilChanged(),
    map(center => new MapCenter(center))
  );

  @Effect()
  selectedToUrl$ = this.actions$.pipe(
    ofType(MAP_SELECTED_LAYER_ID, MAP_SELECTED_DEFAULT_LAYER_ID, MAP_SELECTED_LABELS),
    withLatestFrom(this.store.select('map', 'selected'), (action, selected) => selected),
    map((selected: MapSelectedLayers) => new UrlParamsSync(
      { m: selected.layerId, l: selected.labels }
    ))
  );

  @Effect()
  selectedFromUrl$ = urlParamsInit$(this.store, this.actions$)
    .pipe(
      map(params => ({
        m: this.defaults.selected.layerId,
        l: this.defaults.selected.labels,
        ...params
      })),
      withLatestFrom(this.store.pipe(selectMapLayersWithAccess)),
      map(([params, layers]) => {
        const layerId = params.m;
        const grantedLayerFromUrl = layers.find(layer => layer._id === layerId && !!layer.accessGranted);
        return grantedLayerFromUrl
          ? new MapSelectedFromUrl({ labels: toBoolean(params.l), layerId })
          : new MapSelectedDefaultLayerId(this.defaults.selected.layerId);
      })
    );

  @Effect()
  selectedOnLogout$ = this.actions$.pipe(
    ofType(MAP_SELECTED_FROM_URL),
    switchMap(() => this.store.pipe(selectMapLayersWithAccess)),
    withLatestFrom(this.store.select('map', 'selected')),
    map(([layers, selected]) => layers.find(layer => layer._id === selected.layerId)),
    filter((selectedLayer: MapLayerDefWithAccess) => !selectedLayer || !selectedLayer.accessGranted),
    map(() => new MapSelectedDefaultLayerId(this.defaults.selected.layerId))
  );

  @Effect()
  amplitude$ = this.actions$.pipe(
    ofType(MAP_SELECTED_LAYER_ID, MAP_SELECTED_DEFAULT_LAYER_ID),
    withLatestFrom(this.store.select('map', 'selected'), (res, selected) => selected.layerId),
    map(mapLayer => new AmplitudeTrackEvent('map_layer_change', { mapLayer }))
  );

  @Effect()
  mapLegendToggle = defer(() => {
    const toggle = window.innerWidth < MAP_LEGEND_BREAKPOINT ? 'closed' : 'opened';
      return of(new LayoutMapLegendToggle(toggle));
  });

  // internal state, not very nice
  private lastCenterFromUrl: string;

  constructor(private readonly actions$: Actions, private readonly config: ProspectAppConfig, private readonly store: Store<State>) {
    this.defaults = config.map;
  }

}
