import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import {
  applyDiscountToPrice,
  getInvoiceCompanyRegion,
  InvoiceCompanyRegion,
  Order
} from '@solargis/types/customer';

import { getOrderPriceWithoutVat } from '../../../../shared/admin.utils';
import { Orders } from '../../../constants/orders.constants';

@Component({
  selector: 'sg-admin-order-items-view',
  styleUrls: ['./order-items-view.component.scss'],
  templateUrl: './order-items-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderItemsViewComponent {
  readonly columns: string[] = [
    'index',
    'description',
    'quantity',
    'price',
    'discount',
    'amount'
  ];

  @Input() order: Order;

  applyDiscountToPrice = applyDiscountToPrice;
  getOrderPriceWithoutVat = getOrderPriceWithoutVat;

  getCurrencyName(): string {
    return Orders.currencyToName[this.order.currency] ?? this.order.currency;
  }

  isInvoiceCompanyRegionSK(): boolean {
    return (
      getInvoiceCompanyRegion(this.order.company) === InvoiceCompanyRegion.SK
    );
  }
}
