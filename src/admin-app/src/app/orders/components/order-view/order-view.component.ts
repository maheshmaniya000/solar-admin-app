import { ChangeDetectionStrategy, Component } from '@angular/core';

import { OrderDetailStore } from '../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-view',
  styleUrls: ['./order-view.component.scss'],
  templateUrl: './order-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderViewComponent {
  constructor(readonly orderDetailStore: OrderDetailStore) {}
}
