import * as L from 'leaflet';

import { Site } from '@solargis/types/site';

export function sitesToLatLngBounds(sites: Site[]): L.LatLngBounds {
  return sites.reduce((bounds: L.LatLngBounds, site: Site) => {
  if (site.place && site.place.mapView) {
    const { southWest, northEast } = site.place.mapView;
    bounds.extend(L.latLngBounds(southWest, northEast));
  } else {
    bounds.extend(site.point);
  }
  return bounds;
  }, L.latLngBounds([]));
}
