import { createSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { MapLayerDef, MapLayerDefWithAccess, MapSelectedLayers } from '@solargis/types/map';

import { userCompanyPermissionsSelector } from 'ng-shared/user/selectors/permissions.selectors';

import { State } from '../map.reducer';

const getMapLayers = (state: State): MapLayerDef[] => state.map.layers;
const getMapSelected = (state: State): MapSelectedLayers => state.map.selected;

const mapLayersWithAccessSelector = createSelector(
  getMapLayers,
  userCompanyPermissionsSelector,
  (layers, { userPermissions }) => (layers || []).map(layer => (
    {
      ...layer,
      accessGranted: !layer.access || userPermissions.includes(layer.access)
    } as MapLayerDefWithAccess
  ))
);

export const selectMapLayersWithAccess = pipe(
  select(mapLayersWithAccessSelector),
  shareReplay()
);

export const selectMapSelectedDataKey = pipe(
  select(
    createSelector(
      getMapLayers,
      getMapSelected,
      (layers, selected) => layers.find(def => selected && def._id === selected.layerId)
    )
  ),
  map(layerDef => layerDef && layerDef.dataKey),
  shareReplay()
);
