import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { PvConfig, pvInstalledPower, PvConfigType } from '@solargis/types/pv-config';
import { installedPowerUnit } from '@solargis/units';

@Component({
  selector: 'sg-pv-config-summary',
  templateUrl: './pv-config-summary.component.html'
})
export class PvConfigSummaryComponent implements OnChanges {

  @Input() pvConfig: PvConfig;

  pvInstalledPower: number;

  installedPowerUnit = installedPowerUnit;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pvConfig) {
      this.pvInstalledPower = this.pvConfig && this.pvConfig.type !== PvConfigType.NoPvSystem ?
        pvInstalledPower(this.pvConfig) : undefined;
    }
  }

}
