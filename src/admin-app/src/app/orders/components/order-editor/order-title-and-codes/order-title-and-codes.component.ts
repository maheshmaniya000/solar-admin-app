import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { OrderDetailStore } from '../../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-title-and-codes',
  templateUrl: './order-title-and-codes.component.html',
  styleUrls: ['./order-title-and-codes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderTitleAndCodesComponent {
  @Input() parentForm: FormGroup;

  constructor(readonly orderDetailStore: OrderDetailStore) {}
}
