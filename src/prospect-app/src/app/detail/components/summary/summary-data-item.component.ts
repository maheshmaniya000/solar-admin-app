import { Component, Input } from '@angular/core';

import { DataLayer } from '@solargis/dataset-core';
import { isEmpty, isEmptyField } from '@solargis/types/utils';

@Component({
  selector: 'sg-summary-data-item',
  templateUrl: './summary-data-item.component.html',
  styleUrls: ['./summary-data-item.component.scss']
})
export class SummaryDataItemComponent {

  @Input() layer: DataLayer;
  @Input() data;

  hasRawData(): boolean {
    return typeof this.data !== 'object';
  }

  hasLayerData(): boolean {
    return this.hasRawData() ?  !isEmpty(this.data) : !isEmptyField(this.data, this.layer.key);
  }

  layerData(): any {
    return this.hasRawData() ? this.data : this.data[this.layer.key];
  }

}
