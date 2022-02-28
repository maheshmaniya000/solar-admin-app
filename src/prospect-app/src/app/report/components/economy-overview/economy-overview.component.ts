import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { economyLayersMap } from '@solargis/prospect-detail-calc';

@Component({
  selector: 'sg-economy-overview',
  templateUrl: './economy-overview.component.html',
  styleUrls: ['./economy-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EconomyOverviewComponent {
  @Input() data: { [key: string]: number };

  layerMap = economyLayersMap;
  keys = ['IRRProject', 'IRREquity', 'ROIEquity', 'LCOE'];

}
