import { Order } from '@solargis/types/customer';
import { TableViewSettings } from '@solargis/types/user-company';

import { OrderColumn } from './order-columns.enum';

export class Orders {
  static readonly tableSettingsKey = 'adminOrders';

  static readonly currencyToName: Record<string, string> = {
    $: 'United States Dollars',
    '€': 'Euro'
  };

  static readonly defaultTableSettings: TableViewSettings = {
    columns: [
      OrderColumn.sgOrderId,
      OrderColumn.createDate,
      OrderColumn.modifyDate,
      OrderColumn.company,
      OrderColumn.paymentType,
      OrderColumn.paymentStatus,
      OrderColumn.price,
      OrderColumn.invoices,
      OrderColumn.status,
      OrderColumn.actions
    ]
  };

  static readonly createNew = (): Partial<Order> => ({
    originSystem: 'SGO',
    orderTitle: 'Solargis data and services',
    orderTitleSK: 'Solargis dáta a služby',
    currency: '€',
    price: 0,
    quantity: 0,
    contacts: [],
    orderItems: []
  });
}
