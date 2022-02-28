import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, map, mapTo, switchMap, withLatestFrom } from 'rxjs/operators';

import { removeEmpty } from '@solargis/types/utils';

import { AdminOrdersService } from '../../shared/services/admin-orders.service';
import { AdminStoreFactoryService } from '../../shared/services/admin-store-factory.service';
import { fromAdmin } from '../../store';
import { OrderColumn } from '../constants/order-columns.enum';
import { OrdersActions, OrdersSelectors } from './index';

@Injectable()
export class OrdersEffects {
  updateOrdersList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.changeFilter, OrdersActions.clearFilter, OrdersActions.changeSort),
      mapTo(OrdersActions.load())
    )
  );

  updatePageSize$ = this.adminStoreFactoryService.createUpdatePageSizeEffect(OrdersActions.changePage, OrdersActions.load);

  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.load),
      withLatestFrom(this.store.select(OrdersSelectors.selectFilterPageAndSort)),
      map(([, { filter: orderFilter, page, sort }]) => ({ filter: orderFilter, page, sort })),
      distinctUntilChanged(isEqual),
      switchMap(({ filter: orderFilter, page, sort }) =>
        this.adminOrdersService.listOrders(orderFilter, page, sort).pipe(
          map(res => OrdersActions.loadSuccess({ count: res.count, orders: res.data })),
          catchError(() => of(OrdersActions.loadFailure))
        )
      )
    )
  );

  xlsxExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.exportList),
      withLatestFrom(
        this.store.select(OrdersSelectors.selectFilterPageAndSort),
        this.store.select(OrdersSelectors.selectTableSettings).pipe(map(settings => settings.columns as OrderColumn[])),
        this.store.select(OrdersSelectors.selectMultiselect)
      ),
      switchMap(([, { filter, sort }, columns, selected]) =>
        this.adminOrdersService.exportOrdersXlsx(removeEmpty(filter, true), columns, sort, selected)
      )
    ), { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromAdmin.State>,
    private readonly adminOrdersService: AdminOrdersService,
    private readonly adminStoreFactoryService: AdminStoreFactoryService
  ) {}
}
