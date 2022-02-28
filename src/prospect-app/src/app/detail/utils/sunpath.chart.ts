import { translate } from '@ngneat/transloco';

import { SunpathOptions } from '@solargis/sg-charts';
import { Project } from '@solargis/types/project';
import { Horizon } from '@solargis/types/site';

import { toTimezoneData } from 'ng-shared/utils/timezone.utils';


export function getSunpathOptions(project: Project, horizon: Horizon): SunpathOptions<Horizon> {
  const { lat, lng } = project.site.point;

  const options: SunpathOptions<Horizon> = {
    location: [lat, lng],
    horizon,
    horizonUnit: 'deg',
    timezone: toTimezoneData(project.site.timezone),
    font: {
      family: 'Roboto',
      chart: 12,
      legend: 14,
      axis: 14,
      title: 18
    },
    grid: { spaceLen: 0, x: 0, y: 6 },
    axis: {
      top: { lineWidth: 0.2, ticks: 0, space: 4 },
      bottom: { lineWidth: .4, ticks: 0, space: 4 },
      left: { lineWidth: 0, ticks: 0, space: 4, scale: { from: 0, to: 90, step: 15 } },
      right: { lineWidth: 0 }
    },
    lineLegend: 'bottom',
    areaLegend: 'bottom',
    legend: { line: 0, left: 0 },
    text: {
      cardinal: translate([
        'common.cardinal.north',
        'common.cardinal.east',
        'common.cardinal.south',
        'common.cardinal.west'
      ]),
      sunPath: translate('projectDetail.sunpath.sunpath'),
      juneSolstice: translate('projectDetail.sunpath.juneSolstice'),
      decemberSolstice: translate('projectDetail.sunpath.decemberSolstice'),
      equinox: translate('projectDetail.sunpath.equinox'),
      solarTime: translate('projectDetail.sunpath.solarTime'),
      terrain: translate('projectDetail.sunpath.terrain'),
      module: translate('projectDetail.sunpath.module'),
      sunArea: translate('projectDetail.sunpath.sunArea'),
      axisAzimuth: translate('projectDetail.sunpath.axisAzimuth'),
      axisElevation: translate('projectDetail.sunpath.axisElevation'),
    },
    editing: false
  };

  return options;
}

