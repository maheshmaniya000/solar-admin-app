import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { OrderDetailStore } from '../../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-vat-and-total',
  templateUrl: './order-vat-and-total.component.html',
  styleUrls: ['./order-vat-and-total.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderVatAndTotalComponent {
  @Input() formGroup: FormGroup;

  constructor(readonly orderDetailStore: OrderDetailStore) {}
}
