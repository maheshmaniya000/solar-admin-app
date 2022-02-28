import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { OrderListFilter } from '@solargis/types/customer';

import { Column } from '../../../shared/dialogs/column-selector-dialog.component';
import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { fromAdmin } from '../../../store';
import { OrderColumn } from '../../constants/order-columns.enum';
import { Orders } from '../../constants/orders.constants';
import { OrdersActions, OrdersSelectors } from '../../store';

@Component({
  selector: 'sg-admin-orders-toolbar',
  templateUrl: './orders-toolbar.component.html',
  styleUrls: ['./orders-toolbar.component.scss']
})
export class OrdersToolbarComponent implements OnInit {
  tableSettingsKey = Orders.tableSettingsKey;
  filter$: Observable<OrderListFilter>;
  selectedColumns$: Observable<OrderColumn[]>;

  readonly columns: Omit<Column<OrderColumn>, 'selected'>[] = [
    { label: 'Order ID', props: OrderColumn.sgOrderId },
    { label: 'Created', props: OrderColumn.createDate },
    { label: 'Modified', props: OrderColumn.modifyDate },
    { label: 'Company', props: OrderColumn.company },
    { label: 'Payment type', props: OrderColumn.paymentType },
    { label: 'Payment status', props: OrderColumn.paymentStatus },
    { label: 'Amount & Currency', props: [OrderColumn.price, OrderColumn.currency] },
    { label: 'Invoice', props: OrderColumn.invoices },
    { label: 'Profa Invoice', props: OrderColumn.profaInvoices },
    { label: 'Author', props: OrderColumn.author },
    { label: 'Note', props: OrderColumn.note },
    { label: 'Status', props: OrderColumn.status },
    { label: 'Actions and tools', props: OrderColumn.actions }
  ];

  constructor(private readonly store: Store<fromAdmin.State>, private readonly detailNavigationService: DetailNavigationService) {}

  ngOnInit(): void {
    this.filter$ = this.store.select(OrdersSelectors.selectFilter);
    this.selectedColumns$ = this.store
      .select(OrdersSelectors.selectTableSettings)
      .pipe(map(settings => settings.columns as OrderColumn[]));
  }

  onClearFilterButtonClick(): void {
    this.store.dispatch(OrdersActions.clearFilter());
  }

  onSearchChanged(filter: OrderListFilter): void {
    this.store.dispatch(OrdersActions.changeFilter({ filter }));
  }

  onCreateButtonClick(): void {
    this.detailNavigationService.toAddOrder();
  }

  exportOrderList(): void {
    this.store.dispatch(OrdersActions.exportList());
  }
}
