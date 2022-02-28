import { Component, Input } from '@angular/core';

import { DataLayerMap } from '@solargis/dataset-core';
import { isRefRow, PvLossDiagramRow, PvLossGroup, translateLossesRowKey } from '@solargis/prospect-detail-calc';
import { AnnualDataMap } from '@solargis/types/dataset';
import { Unit, units } from '@solargis/units';

@Component({
  selector: 'sg-pv-losses-diagram',
  templateUrl: './pv-losses-diagram.component.html',
  styleUrls: ['./pv-losses-table.component.scss']
})
export class PvLossesDiagramComponent {
  @Input() lossesDiagram: PvLossDiagramRow[];
  @Input() annualPvCalcData: AnnualDataMap;
  @Input() annualLayers: DataLayerMap;

  percentUnit = units['%'];
  columns = ['sumLabel', 'loss', 'lossLabel'];
  isRefRow = isRefRow;
  translateRowKey = translateLossesRowKey;

  unitByGroup(group: PvLossGroup): Unit {
    switch (group) {
      case 'ghi': return this.annualLayers.get('GHI').unit;
      case 'gti': return this.annualLayers.get('GTI').unit;
      case 'pv': return this.annualLayers.get('PVOUT_specific').unit;
    }
  }
}
