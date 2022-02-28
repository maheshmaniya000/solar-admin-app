import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';

import { AdminOrdersService } from '../../shared/services/admin-orders.service';
import { fromAdmin } from '../../store';
import { OrdersActions, OrdersSelectors } from '../store';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailGuard implements CanActivate {
  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly adminOrderService: AdminOrdersService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.isOrder(route.paramMap.get('sgOrderId'));
  }

  private isOrder(sgOrderId: string): Observable<boolean> {
    return this.isOrderInStore(sgOrderId).pipe(
      first(),
      switchMap(inStore => (inStore ? of(true) : this.isOrderInApi(sgOrderId)))
    );
  }

  private isOrderInStore(sgOrderId: string): Observable<boolean> {
    return this.store.select(OrdersSelectors.selectById(sgOrderId)).pipe(
      map(order => {
        if (!isNil(order)) {
          this.store.dispatch(OrdersActions.select({ order }));
          return true;
        }
        return false;
      }, first())
    );
  }

  private isOrderInApi(sgOrderId: string): Observable<boolean> {
    return this.adminOrderService.getOrder(sgOrderId).pipe(
      map(order => OrdersActions.select({ order })),
      tap(selectOrderAction => this.store.dispatch(selectOrderAction)),
      map(() => true),
      catchError(() => {
        this.router.navigate(['list', 'orders']);
        return of(false);
      })
    );
  }
}
