import { Component, OnChanges, Input } from '@angular/core';

import { PvConfig, PvConfigParamType, PvConfigParamOrder } from '@solargis/types/pv-config';

@Component({
  selector: 'sg-pv-config-viewer',
  templateUrl: './pv-config-viewer.component.html',
  styleUrls: ['./pv-config-viewer.component.scss']
})
export class PvConfigViewerComponent implements OnChanges {

  @Input() pvConfig: PvConfig;
  @Input() size: 'large' | 'small' = 'small';
  @Input() print = false;

  paramOrder: PvConfigParamType[];

  ngOnChanges(): void {
    this.paramOrder = PvConfigParamOrder.filter(type => this.pvConfig[type]);
  }
}
