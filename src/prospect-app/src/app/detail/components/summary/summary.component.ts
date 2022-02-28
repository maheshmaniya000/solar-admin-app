import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';

import { EnergySystem, hasPvConfig as hasPvConfigFunction } from '@solargis/types/project';
import { PvConfig } from '@solargis/types/pv-config';

import { pvConfigDivider } from 'ng-shared/utils/misc';


@Component({
  selector: 'sg-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryComponent implements OnChanges {

  @Input() text: string;
  @Input() energySystem: EnergySystem;
  @Input() hasData: boolean;

  hasPvConfig: boolean;
  pvConfig: PvConfig;

  delimiter = pvConfigDivider;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.energySystem) {
      this.hasPvConfig = hasPvConfigFunction(this.energySystem);
      this.pvConfig = this.energySystem && this.energySystem.pvConfig;
    }
  }
}
