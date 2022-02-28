import { Component, Input, OnChanges } from '@angular/core';

import { PvConfigParamType, PvConfig, PvConfigParamOrder } from '@solargis/types/pv-config';

@Component({
  selector: 'sg-pv-config-miniviewer',
  templateUrl: './pv-config-miniviewer.component.html',
  styleUrls: ['./pv-config-miniviewer.component.scss']
})
export class PvConfigMiniviewerComponent implements OnChanges {

  @Input() pvConfig: PvConfig;
  @Input() size: 'showAll' | 'reduced' = 'reduced';

  pvParams: PvConfigParamType[];

  ngOnChanges(): void {
    this.pvParams = PvConfigParamOrder.filter(type => this.pvConfig[type]);
  }
}
