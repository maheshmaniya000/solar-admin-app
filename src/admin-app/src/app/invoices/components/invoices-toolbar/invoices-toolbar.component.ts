import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InvoiceType } from '@solargis/types/customer';

import { Column } from '../../../shared/dialogs/column-selector-dialog.component';
import { fromAdmin } from '../../../store';
import { InvoiceColumn } from '../../constants/invoice-columns.enum';
import { Invoices } from '../../constants/invoice.constants';
import { InvoicesActions, InvoicesSelectors } from '../../store';

@Component({
  selector: 'sg-admin-invoices-toolbar',
  templateUrl: './invoices-toolbar.component.html',
  styleUrls: ['./invoices-toolbar.component.scss']
})
export class InvoicesToolbarComponent implements OnInit {
  filterCurrency$: Observable<string>;
  filterInvoiceType$: Observable<InvoiceType>;
  tableSettingsKey = Invoices.tableSettingsKey;

  invoiceType = InvoiceType;

  selectedColumns$: Observable<InvoiceColumn[]>;

  readonly columns: Omit<Column<InvoiceColumn>, 'selected'>[] = [
    { label: 'Issue Date', props: InvoiceColumn.issueDate },
    { label: 'Due Date', props: InvoiceColumn.dueDate },
    { label: 'Company', props: InvoiceColumn.company },
    { label: 'Country', props: InvoiceColumn.country },
    { label: 'Item Codes', props: InvoiceColumn.itemCodes },
    { label: 'Price', props: InvoiceColumn.priceWithoutVat },
    { label: 'Vat Amount', props: InvoiceColumn.VAT },
    { label: 'Total Price', props: InvoiceColumn.price },
    { label: 'Currency', props: InvoiceColumn.currency },
    { label: 'Invoice ID', props: InvoiceColumn.invoiceCode },
    { label: 'Payment Method', props: InvoiceColumn.paymentType },
    { label: 'Payment Date', props: InvoiceColumn.paymentDate },
    { label: 'Paid Amount', props: InvoiceColumn.paid },
    { label: 'Unpaid Amount', props: InvoiceColumn.unpaid },
    { label: 'Order owner', props: InvoiceColumn.author },
    { label: 'Order note', props: InvoiceColumn.note }
  ];

  constructor(private readonly store: Store<fromAdmin.State>) {}

  ngOnInit(): void {
    this.filterCurrency$ = this.store.select(InvoicesSelectors.selectFilterCurrency);
    this.filterInvoiceType$ = this.store.select(InvoicesSelectors.selectFilterInvoiceType);

    this.selectedColumns$ = this.store
    .select(InvoicesSelectors.selectTableSettings)
    .pipe(map(settings => settings.columns as InvoiceColumn[]));
  }

  changeCurrency(currency: '€' | '$'): void {
    this.store.dispatch(InvoicesActions.changeFilter({ filter: { order: { currency } } }));
  }

  changeInvoiceType(type: InvoiceType): void {
    this.store.dispatch(InvoicesActions.changeFilter({ filter: { type } }));
  }

  exportInvoiceList(): void {
    this.store.dispatch(InvoicesActions.exportList());
  }
}
