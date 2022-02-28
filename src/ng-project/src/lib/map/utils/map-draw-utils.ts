import area from '@turf/area';
import { Polygon } from 'geojson';
import * as L from 'leaflet';

import { resolveUnitValue, units } from '@solargis/units';

const distanceUnit = units.km;
const areaUnit = units.km2;

function computeArea(points: { lat: number; lng: number }[]): number {
  const coordinates: number[][][] = [points.map(point => [point.lng, point.lat])];
  return area({ type: 'Polygon', coordinates } as Polygon) / 1000000; // square meters to kilometers
}

function edgeMidPoint(a: L.LatLng, b: L.LatLng): L.LatLng {
  return new L.LatLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2);
}

export function getDrawProps(vertices: L.LatLng[]): { edges: L.LatLng[][]; polygonArea: string; circuit: string } {
  const edges = vertices.map((v, i) => (i + 1) === vertices.length ? [vertices[i], vertices[0]] : [vertices[i], vertices[i + 1]]);
  let sum = 0;
  edges.forEach(e => sum = sum + (e[0].distanceTo(e[1]) / 1000));
  const areaValue = computeArea(vertices);

  const aUnit = areaValue > 1 ? 'km2' : 'm2';
  const dUnit = sum > 1 ? 'km' : 'm';

  return {
    edges,
    polygonArea: `${resolveUnitValue(areaUnit, areaValue, [aUnit])} ${aUnit.replace('2', '<sup>2</sup>')}`,
    circuit: `${resolveUnitValue(distanceUnit, sum, [dUnit])} ${dUnit}`
  };
}

export function midPointMarkers(edges: any[] = [], tooltipOptions: L.TooltipOptions): L.Marker[] {
  return edges.map(([a, b]) => {
    const midPoint = edgeMidPoint(a, b);
    const distance = resolveUnitValue(distanceUnit, a.distanceTo(b) / 1000);
    const unit = distance > 1 ? 'km' : 'm';
    return L.marker(midPoint, { icon: new L.DivIcon({ iconSize: new L.Point(1, 1), className: 'mid-point-icon' }) })
      .bindTooltip(`${resolveUnitValue(distanceUnit, distance, [unit])} ${unit}`, tooltipOptions);
  });
}

