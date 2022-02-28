import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DataLayer } from '@solargis/dataset-core';
import { isRefRow, PvLossTableRow, translateLossesRowKey } from '@solargis/prospect-detail-calc';
import { units } from '@solargis/units';

@Component({
  selector: 'sg-pv-losses-table',
  templateUrl: './pv-losses-table.component.html',
  styleUrls: ['./pv-losses-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvLossesTableComponent {
  @Input() lossesTable: PvLossTableRow[];
  @Input() gtiLayer: DataLayer;
  @Input() pvoutSpecificLayer: DataLayer;

  percentUnit = units['%'];
  columns = ['label', 'solarEnergy', 'solarEnergyDelta', 'pvEnergy', 'pvEnergyDelta', 'lossPercent', 'pr'];
  isRefRow = isRefRow;
  translateRowKey = translateLossesRowKey;

  notEmpty(val): boolean {
    return typeof val !== 'undefined' && val !== null;
  }

}
