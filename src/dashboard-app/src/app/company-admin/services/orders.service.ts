import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Page } from '@solargis/types/api';
import { Order, OrderListRequest, OrderListResponse } from '@solargis/types/customer';

import { Config } from 'ng-shared/config';
import { MimeType } from 'ng-shared/shared/utils/download.utils';

// TODO: move Order status filtering to backend
function isNewerThan90Days(order: Order): boolean {
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return !(order.status.status === 'USER_STARTED' && order.updated.ts < ninetyDaysAgo);
}

/**
 * Service providing API for admin orders API
 */
@Injectable()
export class OrdersService {

  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  /**
   * List of all orders from API
   */
  listOrders(sgCompanyId: string, page: Page): Observable<Order[]> {
    return (this.http.put<OrderListResponse>(
      `${this.config.api.customerUrl}/company/${sgCompanyId}/order`,
      { filter: {}, page } as OrderListRequest
    )).pipe(
      map((ordersResponse: OrderListResponse) => ordersResponse.count ? ordersResponse.data : []),
      map((orders: Order[]) => orders.filter(o => isNewerThan90Days(o))), // FIXME why???
    );
  }

  /**
   * Get specific order detail
   */
  getOrder(sgCompanyId: string, sgOrderId: string): Observable<Order> {
    return this.http.get<Order>(this.orderApiUrl({ sgCompanyId, sgOrderId }));
  }

  downloadInvoice(sgCompanyId: string, sgOrderId: string, invoiceCode: string): Observable<any> {
    return this.http.get(
      `${this.orderApiUrl({ sgCompanyId, sgOrderId })}/invoice/${invoiceCode}`,
      { responseType: 'arraybuffer', headers: { accept: MimeType.PDF } }
    );
  }

  cancelOrder(order: Order): Observable<any> {
    return this.http.delete<Order>(`${this.orderApiUrl(order)}`);
  }

  private orderApiUrl(order: { sgCompanyId: string; sgOrderId: string }): string {
    return `${this.config.api.customerUrl}/company/${order.sgCompanyId}/order/${order.sgOrderId}`;
  }

}
