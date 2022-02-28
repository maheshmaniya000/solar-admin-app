import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { AnnualDataMap } from '@solargis/types/dataset';
import { EconomyInput } from '@solargis/types/economy';
import { SystemConfig } from '@solargis/types/pvlib';

import { EconomyInputsRow, economyInputsRows } from '../../utils/economy-inputs';

@Component({
  selector: 'sg-economy-inputs',
  templateUrl: './economy-inputs.component.html',
  styleUrls: ['./economy-inputs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EconomyInputsComponent implements OnInit {
  @Input() inputs: EconomyInput;
  @Input() annualPvCalcData: AnnualDataMap;
  @Input() system: SystemConfig;

  rows: (string | EconomyInputsRow)[];

  ngOnInit(): void {
    this.rows = economyInputsRows(this.inputs, this.annualPvCalcData, this.system);
  }
}
