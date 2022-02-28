import { Component, Input, OnChanges } from '@angular/core';

import {
  PvConfigParam,
  PvConfigParamType,
  pvInstalledPower,
  SystemPvConfig,
  TransformerType,
  getInverterEfficiency,
  getTransformerLoss
} from '@solargis/types/pv-config';
import { MonthlyArray } from '@solargis/types/pvlib';
import { installedPowerUnit } from '@solargis/units';

import { pvConfigDivider } from 'ng-shared/utils/misc';

@Component({
  selector: 'sg-pv-config-param-value',
  templateUrl: './pv-config-param-value.component.html',
  styleUrls: ['./pv-config-param-value.component.scss']
})
export class PvConfigParamValueComponent implements OnChanges {

  @Input() param: PvConfigParam;
  @Input() type: PvConfigParamType;
  @Input() pvConfig?: SystemPvConfig;

  installedPower: number;
  installedPowerUnit = installedPowerUnit;

  getInverterEfficiency = getInverterEfficiency;
  getTransformerLoss = getTransformerLoss;
  noneTrasformer = TransformerType.None;

  divider = pvConfigDivider;

  max = (x: MonthlyArray | number): number => Array.isArray(x) ? Math.max(...x) : x;

  ngOnChanges(): void {
    if (this.type === PvConfigParamType.SystemSize) {
      this.installedPower = pvInstalledPower(this.pvConfig);
    }
  }

}
