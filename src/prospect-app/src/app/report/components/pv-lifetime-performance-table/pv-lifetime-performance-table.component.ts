import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Dataset } from '@solargis/dataset-core';
import { PvLifetimePerformance } from '@solargis/prospect-detail-calc';
import { units } from '@solargis/units';

@Component({
  selector: 'sg-pv-lifetime-performance-table',
  templateUrl: './pv-lifetime-performance-table.component.html',
  styleUrls: ['./pv-lifetime-performance-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvLifetimePerformanceTableComponent {
  @Input() performanceTable: PvLifetimePerformance[];
  @Input() pvcalcDataset: Dataset;

  columns = ['id', 'DEGRAD', 'PVOUT_specific', 'PVOUT_total', 'PR'];
  percentUnit = units['%'];

}
