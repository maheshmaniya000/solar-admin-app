import { TableViewSettings } from '@solargis/types/user-company';

import { InvoiceColumn } from './invoice-columns.enum';

export class Invoices {
    static readonly tableSettingsKey = 'adminInvoices';

    static readonly defaultTableSettings: TableViewSettings = {
      columns: [
        InvoiceColumn.issueDate,
        InvoiceColumn.dueDate,
        InvoiceColumn.company,
        InvoiceColumn.country,
        InvoiceColumn.itemCodes,
        InvoiceColumn.priceWithoutVat,
        InvoiceColumn.VAT,
        InvoiceColumn.price,
        InvoiceColumn.currency,
        InvoiceColumn.invoiceCode,
        InvoiceColumn.paymentType,
        InvoiceColumn.paymentDate,
        InvoiceColumn.paid,
        InvoiceColumn.unpaid,
        InvoiceColumn.author,
        InvoiceColumn.note
      ]
    };
  }
