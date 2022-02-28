import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { removeEmpty } from '@solargis/types/utils';

import { AdminInvoicesService } from '../../shared/services/admin-invoices.service';
import { AdminOrdersService } from '../../shared/services/admin-orders.service';
import { AdminStoreFactoryService } from '../../shared/services/admin-store-factory.service';
import { fromAdmin } from '../../store';
import { InvoiceColumn } from '../constants/invoice-columns.enum';
import { InvoicesActions, InvoicesSelectors } from './';

@Injectable()
export class InvoicesEffects {
  updateInvoiceList$ = createEffect(() =>
    this.actions$.pipe(ofType(InvoicesActions.changeFilter, InvoicesActions.changeSort), map(InvoicesActions.loadInvoices))
  );

  updatePageSize$ = this.adminStoreFactoryService.createUpdatePageSizeEffect(
    InvoicesActions.changePage,
    InvoicesActions.loadInvoices
  );

  loadInvoices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.loadInvoices),
      withLatestFrom(this.store.select(InvoicesSelectors.selectFilterPageAndSort)),
      switchMap(([, { filter, page, sort }]) => this.adminInvoicesService.listInvoices(removeEmpty(filter, true), page, sort)),
      map(res => InvoicesActions.loadInvoicesSuccess(res)),
      catchError(() => of(InvoicesActions.loadInvoicesFailure))
    )
  );

  editNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.editNote),
      switchMap(action => this.adminOrderService.updateOrder(action.order.sgOrderId, { note: action.note })),
      map(InvoicesActions.loadInvoices)
    )
  );

  xlsxExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.exportList),
      withLatestFrom(
        this.store.select(InvoicesSelectors.selectFilterPageAndSort),
        this.store.select(InvoicesSelectors.selectTableSettings).pipe(map(settings => settings.columns as InvoiceColumn[])),
        this.store.select(InvoicesSelectors.selectMultiselect)
      ),
      switchMap(([, { filter, sort }, column, selected]) =>
        this.adminInvoicesService.exportInvoicesXlsx(removeEmpty(filter, true), column, sort, selected)
      )
    ), { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly adminInvoicesService: AdminInvoicesService,
    private readonly adminOrderService: AdminOrdersService,
    private readonly store: Store<fromAdmin.State>,
    private readonly adminStoreFactoryService: AdminStoreFactoryService
  ) {}
}
