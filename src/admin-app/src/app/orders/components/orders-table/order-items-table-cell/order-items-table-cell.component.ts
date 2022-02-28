import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Invoice, InvoiceType, Order } from '@solargis/types/customer';

import { DownloadInvoiceStore } from '../../../../shared/store/download-invoice/download-invoice.store';

@Component({
  selector: 'sg-admin-order-items-table-cell',
  templateUrl: './order-items-table-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderItemsTableCellComponent {
  @Input() invoiceTypes: InvoiceType[];
  @Input() order: Order;

  constructor(readonly downloadInvoiceStore: DownloadInvoiceStore) {}

  invoicesByType(order: Order, types: InvoiceType[]): Invoice[] {
    return this.order.invoices?.filter(i => types.includes(i.type));
  }
}
