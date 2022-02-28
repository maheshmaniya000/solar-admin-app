import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { catchError, finalize, mergeMap, tap } from 'rxjs/operators';

import { getInvoiceFileName, Order, InvoiceWithOrder  } from '@solargis/types/customer';

import { downloadBinaryFile, MimeType } from 'ng-shared/shared/utils/download.utils';

import { AdminActions, fromAdmin } from '../../../store';
import { AdminInvoicesService } from '../../services/admin-invoices.service';

export interface DownloadingState {
  downloadingInvoice: Record<string, boolean>;
}

@Injectable()
export class DownloadInvoiceStore extends ComponentStore<DownloadingState> {
  readonly setDownloadingInvoice = this.updater((state, { invoiceCode, status }: { invoiceCode: string; status: boolean }) => ({
    ...state,
    downloadingInvoice: {
      ...state.downloadingInvoice,
      [invoiceCode]: status
    }
  }));

  readonly downloadInvoice = this.effect((invoices$: Observable<InvoiceWithOrder>) =>
    invoices$.pipe(
      tap(({ invoiceCode }) => this.setDownloadingInvoice({ invoiceCode, status: true })),
      mergeMap(invoice =>
        this.downloadInvoiceFile(invoice).pipe(
          catchError(() => EMPTY),
          finalize(() => this.setDownloadingInvoice({ invoiceCode: invoice.invoiceCode, status: false }))
        )
      ),
    )
  );

  readonly downloadInvoiceForOrder = (order: Order, invoiceCode: string): Subscription => this.downloadInvoice(
    this.orderToInvoiceWithOrder(order, invoiceCode)
  );

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly snackBar: MatSnackBar,
    private readonly invoiceService: AdminInvoicesService
  ) {
    super({ downloadingInvoice: {} });
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError' }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }

  private orderToInvoiceWithOrder(order: Order, invoiceCode: string): InvoiceWithOrder {
    return {...order.invoices.find(invoice => invoice.invoiceCode === invoiceCode), order};
  }

  private downloadInvoiceFile(invoice: InvoiceWithOrder): Observable<any> {
    return this.invoiceService.downloadInvoice(invoice.order.sgCompanyId, invoice.order.sgOrderId, invoice.invoiceCode).pipe(
      tap({
        next: res => {
          downloadBinaryFile(
            res,
            getInvoiceFileName(
              invoice,
              invoice.order.company?.name
            ),
            MimeType.PDF,
            this.snackBar
          );
        },
        error: () =>
          this.showSnackbarMessage({
            message: 'Invoice could NOT be downloaded',
            styleClass: 'snackbarError'
          })
      })
    );
  }
}
