import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { filter, first, publishReplay, refCount, switchMap, take, tap } from 'rxjs/operators';

import { getInvoiceFileName, Invoice, Order, OrderItem } from '@solargis/types/customer';
import { round } from '@solargis/types/utils';

import { State } from 'ng-shared/core/reducers';
import { PaymentDialogComponent } from 'ng-shared/payment/containers/payment-dialog/payment-dialog.component';
import { PaymentStatusDialogComponent } from 'ng-shared/payment/containers/payment-status-dialog/payment-status-dialog.component';
import { isBankPaymentPending } from 'ng-shared/payment/payment.utils';
import { getProductNameTranslation } from 'ng-shared/payment/utils/products.utils';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { downloadBinaryFile, MimeType } from 'ng-shared/shared/utils/download.utils';
import { selectActiveCompany } from 'ng-shared/user/selectors/company.selectors';
import { selectIsUserAdmin } from 'ng-shared/user/selectors/permissions.selectors';

import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'sg-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent extends SubscriptionAutoCloseComponent implements OnInit {

  order: Order;

  // TODO: remove after payments are enabled
  isAdmin$: Observable<boolean>;

  downloading = false;
  getProductNameTranslation = getProductNameTranslation;
  isBankPaymentPending = isBankPaymentPending;


  reloadOrder$ = new BehaviorSubject<null>(null);

  constructor(
    private readonly orderService: OrdersService,
    private readonly store: Store<State>,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    const order$ = this.reloadOrder$.pipe(
      switchMap(() => combineLatest(
        this.store.pipe(selectActiveCompany),
        this.route.params
      )),
      switchMap(([company, params]) => this.orderService.getOrder(company.sgCompanyId, params.sgOrderId )),
      publishReplay(),
      refCount()
    );

    this.route.queryParams.pipe(
      first(),
      filter(params => params && params.openPaymentStatus),
      switchMap(() => order$),
      take(1),
    ).subscribe(
      order => setTimeout(() => {
        this.dialog.open(PaymentStatusDialogComponent, {
          data: order
        });
      })
    );

    this.addSubscription(
      order$.subscribe(order => this.order = order)
    );

    this.isAdmin$ = this.store.pipe(selectIsUserAdmin);
  }

  getItemPriceWithDiscount(item: OrderItem): number {
    const price = item.price;
    if (item.discount && item.discount.amount) {return price - item.discount.amount;}
    if (item.discount && item.discount.percent) {return price * (100 - item.discount.percent) * 0.01;}
    return price;
  }

  getVATprice(): number {
    return round((this.order.price / (this.order.VAT_ID + 100)) * this.order.VAT_ID, 2);
  }

  downloadInvoice(invoice: Invoice): void {
    this.downloading = true;

    this.orderService.downloadInvoice(
      this.order.sgCompanyId,
      this.order.sgOrderId,
      invoice.invoiceCode
    ).subscribe((res => {
      downloadBinaryFile(res, getInvoiceFileName(invoice, this.order?.company?.name), MimeType.PDF, this.snackBar);

      this.snackBar.open(
        translate('companyAdmin.billing.invoiceDownloaded'),
        null,
        { duration: 5000 }
      );
      this.downloading = false;
    }), () => {
      this.snackBar.open(
        translate('companyAdmin.billing.errorDownloadingInvoice'),
        null,
        { duration: 5000 }
      );
      this.downloading = false;
    });
  }

  openPayment(): void {
    this.dialog.open(PaymentDialogComponent, {
      data: { order: this.order },
      minWidth: 200
    })
    .afterClosed()
    .subscribe(() => this.reloadOrder$.next(null));
  }

  cancelOrder(): void {
    this.dialog.open(ConfirmationDialogComponent, {}).afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.orderService.cancelOrder(this.order).pipe(
            tap(() => this.router.navigate(['company-admin', 'billing']))
          );
        } else {return of(false);}
      }),
    ).subscribe();
  }
}
