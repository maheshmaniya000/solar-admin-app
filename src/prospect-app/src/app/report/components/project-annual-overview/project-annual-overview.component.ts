import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Dataset } from '@solargis/dataset-core';
import { AnyDataMap } from '@solargis/types/dataset';
import { Unit } from '@solargis/units';

import { parseAnnualPVOUT } from '../../utils/pvout-annual.utils';

@Component({
  selector: 'sg-project-annual-overview',
  templateUrl: './project-annual-overview.component.html',
  styleUrls: ['./project-annual-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectAnnualOverviewComponent {

  @Input() data: AnyDataMap;
  @Input() keys: string[];
  @Input() dataset: Dataset;

  parseData(key: string): [ Unit, number ] {
    if (key === 'PVOUT_total') {
      return parseAnnualPVOUT(this.data[key]);
    } else {
      return [ this.dataset.annual.get(key).unit, this.data[key] ];
    }
  }
}
