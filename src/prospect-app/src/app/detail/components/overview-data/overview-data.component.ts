import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import {
  DataLayer,
  DataLayerMap,
  isLayerCodelistValue
} from '@solargis/dataset-core';
import {
  AnnualDataMap,
  DataStatsMap,
  MonthlyDataMap
} from '@solargis/types/dataset';
import { TranslationDef } from '@solargis/types/translation';
import { isEmpty, isEmptyField } from '@solargis/types/utils';

@Component({
  selector: 'sg-overview-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-data.component.html',
  styleUrls: ['./overview-data.component.scss']
})
export class OverviewDataComponent {
  @Input() dataLayers: DataLayerMap;
  @Input() data: AnnualDataMap;

  @Input() monthlyDataStats: DataStatsMap;
  @Input() monthlyData: MonthlyDataMap;

  @Input() hideKeys = false;
  @Input() mergeTranslationData = false;
  @Input() hideName = false;

  isCodelistValue(layer: DataLayer): boolean {
    return isLayerCodelistValue(layer, this.data && this.data[layer.key]);
  }

  hasAnnualData(layer: DataLayer): boolean {
    return !isEmptyField(this.data, layer.key);
  }

  hasMonthlyData(): boolean {
    return !isEmpty(this.monthlyData);
  }

  translationDefWithData(def: TranslationDef): TranslationDef {
    if (!this.mergeTranslationData) {
      return def;
    } else {
      return {
        translate: def.translate,
        translateParams: {
          ...def.translateParams,
          ...this.data
        }
      };
    }
  }
}
