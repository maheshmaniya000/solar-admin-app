import { MapLayerDef, MapSelectedLayers } from '@solargis/types/map';
import { LatLngZoom } from '@solargis/types/site';

import { State as ProjectListState } from 'ng-project/project-list/reducers';
import { State as UserState } from 'ng-shared/user/reducers';

import * as MapActions from './map.actions';

export type MapDrawMode = 'site' | 'rectangle' | 'polygon' | 'region' | 'distance';

export type MapState = {
  center: LatLngZoom;
  layers: MapLayerDef[];
  selected: MapSelectedLayers;
  drawMode: MapDrawMode;
  showLargeMarkers: boolean;
};

export interface State extends UserState, ProjectListState {
  map: MapState;
}

export function mapCenterReducer(state: LatLngZoom, action: MapActions.MapCenterActions): LatLngZoom {
  switch (action.type) {
    case MapActions.MAP_CENTER:
    case MapActions.MAP_CENTER_MOVE_END: {
      return { ...state, ...action.payload };
    }
    default: {
      return state;
    }
  }
}

export function mapLayersReducer(state: MapLayerDef[] = [], action: MapActions.MapLayersFromConfig): MapLayerDef[] {
  switch (action.type) {
    case MapActions.MAP_LAYERS_FROM_CONFIG:
      return action.payload;
    default:
      return state;
  }
}

export function mapSelectedReducer(state: MapSelectedLayers, action: MapActions.MapSelectedActions): MapSelectedLayers {
  switch (action.type) {
    case MapActions.MAP_SELECTED_FROM_URL: {
      return { ...state, ...action.payload };
    }
    case MapActions.MAP_SELECTED_LABELS: {
      return { ...state, labels: action.payload };
    }
    case MapActions.MAP_SELECTED_LAYER_ID:
    case MapActions.MAP_SELECTED_DEFAULT_LAYER_ID: {
      return { ...state, layerId: action.payload };
    }
    default: {
      return state;
    }
  }
}

export function mapDrawModeReducer(state: MapDrawMode, action: MapActions.MapDrawModeChange): MapDrawMode {
  switch (action.type) {
    case MapActions.MAP_DRAW_MODE_CHANGE:
      return action.payload;
    default:
      return state;
  }
}

export function mapMarkersToggle(state = true, action: MapActions.MapMarkersActions): boolean {
  switch (action.type) {
    case MapActions.MAP_MARKERS_TOGGLE:
      return action.payload;
    default:
      return state;
  }
}

export const mapReducer = {
  center: mapCenterReducer,
  layers: mapLayersReducer,
  selected: mapSelectedReducer,
  drawMode: mapDrawModeReducer,
  showLargeMarkers: mapMarkersToggle
};

