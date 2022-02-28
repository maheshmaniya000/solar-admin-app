import { object as jsonTemplater } from 'json-templater';

import { MapLayerDef } from '@solargis/types/map';

import mapLayers from '../defaults/map-layers.json';
import { eventBus } from '../events';

export class MapLayersService {

  constructor() {
    eventBus.on('listening', async () => {
      // DB init on app listening
    });
  }

  async mapLayers(): Promise<MapLayerDef[]> {
    const enabledLayers = mapLayers.filter(layer => !layer.disabled);
    return jsonTemplater(enabledLayers, {
      env: process.env,
      now: { year: new Date().getFullYear() }
    });
  }

}
