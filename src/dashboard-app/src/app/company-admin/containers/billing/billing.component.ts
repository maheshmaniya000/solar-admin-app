import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first, map, publishReplay, refCount, switchMap, tap } from 'rxjs/operators';

import { getInvoiceFileName, Invoice, Order } from '@solargis/types/customer';

import { State } from 'ng-shared/core/reducers';
import { PaymentDialogComponent } from 'ng-shared/payment/containers/payment-dialog/payment-dialog.component';
import { isBankPaymentPending } from 'ng-shared/payment/payment.utils';
import {
    ConfirmationDialogComponent, ConfirmationDialogMultiInput
} from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { downloadBinaryFile, MimeType } from 'ng-shared/shared/utils/download.utils';
import { selectActiveCompany } from 'ng-shared/user/selectors/company.selectors';
import { selectIsUserAdmin } from 'ng-shared/user/selectors/permissions.selectors';

import { OrdersService } from '../../services/orders.service';
import { BillingOrdersDataSource, getOrderYear } from './billing-orders.data-source';

@Component({
  selector: 'sg-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent extends SubscriptionAutoCloseComponent implements OnInit {

  isBankPaymentPending = isBankPaymentPending;

  dataSource$: BillingOrdersDataSource;
  columns = ['order', 'price', 'date', 'status', 'payment', 'delivery', 'buttons'];

  numOrders = -1;

  pageEvent$ = new BehaviorSubject<PageEvent>(null);
  PAGE_SIZE = 10;

  years$: Observable<number[]>;
  yearFilter$ = new BehaviorSubject<number>(-1);

  // TODO: remove after payments are enabled
  isAdmin$: Observable<boolean>;

  refreshOrders$ = new BehaviorSubject<null>(null);

  sort$ = new BehaviorSubject<Sort>({ active: 'date', direction: 'asc' });

  workingId: string = null;

  constructor(
    private readonly store: Store<State>,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly orderService: OrdersService,
  ) {
    super();
  }

  ngOnInit(): void {
    const orders$ = this.refreshOrders$.pipe(
      switchMap(() => this.store.pipe(selectActiveCompany)),
      switchMap(company => this.orderService.listOrders(company.sgCompanyId, { size: 10000, index: 0 })),
      publishReplay(),
      refCount(),
    );
    this.refreshOrders$.next(null);

    this.dataSource$ = new BillingOrdersDataSource(
      orders$,
      this.pageEvent$,
      this.PAGE_SIZE,
      this.yearFilter$,
      this.sort$
    );

    this.years$ = orders$.pipe(
      map(orders => {
        if (orders.length === 0) {return [];}
        else {
          const years = orders.map(order => getOrderYear(order));
          const unique = [...new Set(years)];
          unique.sort().reverse();
          return [-1, ...unique];
        }
      })
    );

    this.addSubscription(
      this.dataSource$.getCount().subscribe(
        count => this.numOrders = count
      )
    );

    this.isAdmin$ = this.store.pipe(selectIsUserAdmin);
  }

  downloadInvoice(order: Order, invoice: Invoice): void {
    this.workingId = order.sgOrderId;

    this.orderService.downloadInvoice(
      order.sgCompanyId,
      order.sgOrderId,
      invoice.invoiceCode
    ).subscribe((res => {
      downloadBinaryFile(res, getInvoiceFileName(invoice, order?.company?.name), MimeType.PDF, this.snackBar);

      this.snackBar.open(
        translate('companyAdmin.billing.invoiceDownloaded'),
        null,
        { duration: 5000 }
      );
      this.workingId = null;
    }), () => {
      this.snackBar.open(
        translate('companyAdmin.billing.errorDownloadingInvoice'),
        null,
        { duration: 5000 }
      );
      this.workingId = null;
    });
  }

  openPayment(order: Order): void {
    this.dialog.open(PaymentDialogComponent, {
      data: { order },
      minWidth: 200
    }).afterClosed().subscribe(() => this.refreshOrders$.next(null));
  }

  openPaymentInfo(order: Order): void {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: { translate: 'payment.dialog.headline', translateParams: { sum: `${order.price} ${order.currency}` } },
        text: 'payment.method.bankDesc',
        actions: [{
          text: 'payment.dialog.change',
          value: true
        }, {
          text: 'common.action.close',
          value: false,
          default: true
        }]
      } as ConfirmationDialogMultiInput
    }).afterClosed().subscribe(result => {
      if (result) {this.openPayment(order);}
    });
  }

  cancelOrder(order: Order): void {
    this.workingId = order.sgOrderId;

    this.dialog.open(ConfirmationDialogComponent, {}).afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.orderService.cancelOrder(order).pipe(
            tap(() => this.refreshOrders$.next(null))
          );
        } else {return of(false);}
      }),
      first()
    ).subscribe(() => this.workingId = null);
  }
}
