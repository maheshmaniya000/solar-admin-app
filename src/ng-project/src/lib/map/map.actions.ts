import { Action } from '@ngrx/store';

import { MapLayerDef, MapSelectedLayers } from '@solargis/types/map';
import { LatLngZoom, LatLng } from '@solargis/types/site';

import { MapDrawMode } from './map.reducer';

export const MAP_CENTER_MOVE_END = '[map] center move end'; // center changed
export const MAP_CENTER = '[map] center';
export const MAP_LAYERS_FROM_CONFIG = '[map] init from config';
export const MAP_SELECTED_FROM_URL = '[map] selected from url';
export const MAP_SELECTED_LABELS = '[map] selected labels';
export const MAP_SELECTED_LAYER_ID = '[map] selected layerId';
export const MAP_SELECTED_DEFAULT_LAYER_ID = '[map] selected default layerId';
export const MAP_DRAW_MODE_CHANGE = '[map] draw mode change';
export const MAP_MARKERS_TOGGLE = '[map] markers toggle';

export class MapCenterMoveEnd implements Action {
  readonly type = MAP_CENTER_MOVE_END;
  constructor(public payload: LatLngZoom) {}
}

export class MapCenter implements Action {
  readonly type = MAP_CENTER;
  constructor(public payload: LatLng | LatLngZoom, public from = 'url') {}
}

export class MapLayersFromConfig implements Action {
  readonly type = MAP_LAYERS_FROM_CONFIG;
  constructor(public payload: MapLayerDef[]) {}
}

export class MapSelectedFromUrl implements Action {
  readonly type = MAP_SELECTED_FROM_URL;
  constructor(public payload: MapSelectedLayers) {}
}

export class MapSelectedLabels implements Action {
  readonly type = MAP_SELECTED_LABELS;
  constructor(public payload: boolean) {}
}

export class MapSelectedLayerId implements Action {
  readonly type = MAP_SELECTED_LAYER_ID;
  constructor(public payload: string) {}
}

export class MapSelectedDefaultLayerId implements Action {
  readonly type = MAP_SELECTED_DEFAULT_LAYER_ID;
  constructor(public payload: string) {}
}

export class MapDrawModeChange implements Action {
  readonly type = MAP_DRAW_MODE_CHANGE;
  constructor(public payload: MapDrawMode) {}
}

export class MapMarkersToggle implements Action {
  readonly type = MAP_MARKERS_TOGGLE;
  constructor(public payload: boolean) {}
}

export type MapCenterActions = MapCenterMoveEnd | MapCenter;

export type MapSelectedActions = MapSelectedFromUrl | MapSelectedLabels | MapSelectedLayerId | MapSelectedDefaultLayerId;

export type MapMarkersActions = MapMarkersToggle;
