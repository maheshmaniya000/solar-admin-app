import { Component } from '@angular/core';

import { getInvoiceFileName, Invoice, InvoiceType } from '@solargis/types/customer';

import { OrderDetailStore } from '../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-invoices',
  templateUrl: './order-invoices.component.html',
  styleUrls: ['./order-invoices.component.scss']
})
export class OrderInvoicesComponent {
  getInvoiceFileName = getInvoiceFileName;

  constructor(readonly orderDetailStore: OrderDetailStore) {}

  canDelete(invoice: Invoice): boolean {
    return invoice.type === InvoiceType.CN;
  }
}
