import { DataLayer } from '@solargis/dataset-core';
import { UnitToggleSettings } from '@solargis/units';

import { GrassFileLegend, GrassFileLegendList, GrassFileValueColor } from './grass-file.parser';
import { MapLegendRenderer } from './map-legend.renderer';

// filter duplicate codelist colors
function filterDuplicateColors(list: GrassFileLegendList): GrassFileLegendList {
  let filteredLines: GrassFileValueColor[] = [];

  list.forEach((line: GrassFileValueColor) => {
    const isExistingColor = filteredLines.find(filteredLine => filteredLine ? line.color === filteredLine.color : null);
    if (!isExistingColor) {
      filteredLines = [...filteredLines, line];
    }
  });
  return filteredLines;
}

export const legendWidths = {
  LANDC: 260,
  AZI: 120,
  ELE: 150,
  default: 80,
};

export const legendHeights = {
  AZI: 170,
  default: 280,
};

export function generateMapLegend(
  ctx: CanvasRenderingContext2D,
  grassLegend: GrassFileLegend,
  layer: DataLayer,
  unitToggle: UnitToggleSettings,
): void {
  const renderer = new MapLegendRenderer(ctx, layer, unitToggle);

  grassLegend.forEach((list, i) => {
    const isAzimuth = layer.key === 'AZI';
    const startX = (ctx.canvas.clientWidth || ctx.canvas.width) / grassLegend.length * i;

    if (Array.isArray(list[0])) { // list with range
      if (!isAzimuth) {
        renderer.renderRangeLegend(list, startX);
      } else {
        renderer.renderAzimuthLegend(list);
      }
    } else { // codelist
      renderer.renderCodeListLegend(filterDuplicateColors(list));
    }
  });
}
