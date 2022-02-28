import { translate } from '@ngneat/transloco';

import { DayLengthOptions } from '@solargis/sg-charts';
import { HorizonDefinition } from '@solargis/sg-charts/dist/main/Horizon'; // FIXME why importing from dist?
import { Project } from '@solargis/types/project';

import { months } from 'ng-shared/utils/translation.utils';

export function getDaylengthOptions(project: Project, horizon: HorizonDefinition): DayLengthOptions {
  const { lat, lng } = project.site.point;

  const options: DayLengthOptions = {
    location: [lat, lng],
    horizon,
    horizonUnit: 'deg',
    font: {
      family: 'Roboto',
      size: {
        tick: 12,
        legend: 14,
        axis: 14,
        title: 14,
        mark: 13
      }
    },
    text: {
      title: '',
      dayLength: translate('projectDetail.daylength.daylength'),
      minimumZenithAngle: translate('projectDetail.daylength.minimumZenitAngle'),
      dayLengthHorizonCorrected: translate('projectDetail.daylength.dayLengthHorizonCorrected'),
      months: translate(months),
      border: translate([
        'projectDetail.daylength.vernalEquinox',
        'projectDetail.sunpath.summerSolstice',
        'projectDetail.daylength.autumnEquinox',
        'projectDetail.sunpath.winterSolstice'
      ])
    }
  };

  return options;
}

