import { ChangeDetectionStrategy, Component } from '@angular/core';

import { OrderDetailStore } from '../../services/order-detail.store';

@Component({
  selector: 'sg-admin-view-order-tools',
  styleUrls: ['./view-order-tools.component.scss'],
  templateUrl: './view-order-tools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewOrderToolsComponent {
  constructor(readonly orderDetailStore: OrderDetailStore) {}
}
