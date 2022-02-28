import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Page, Sort } from '@solargis/types/api';
import {
  Order,
  OrderListFilter,
  OrderListRequest,
  OrderListResponse,
  TransferOrderOpts,
  UpdateOrderOpts
} from '@solargis/types/customer';
import { removeEmpty, removeEmptyStrings } from '@solargis/types/utils';

import { Config } from 'ng-shared/config';

import { xslxExport } from '../admin.utils';

const defaultSort: Sort = { sortBy: 'author.ts', direction: 'desc' };

/**
 * Service providing API for admin orders API
 */
@Injectable({
  providedIn: 'root'
})
export class AdminOrdersService {
  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  listOrders(ordersFilter: OrderListFilter = {}, page: Page, sort: Sort): Observable<OrderListResponse> {
    const filter = removeEmpty(ordersFilter, true, true, true) ?? {};
    filter.status = ordersFilter.status;
    const request: OrderListRequest = { filter, page, sort: { ...defaultSort, ...sort } };
    return this.http.put<OrderListResponse>(`${this.config.api.customerUrl}/admin/order`, request);
  }

  exportOrdersXlsx(ordersFilter: OrderListFilter = {}, columns: string[], sort?: Sort, selected?: string[]): Observable<any> {
    const filter = removeEmpty(ordersFilter, true, true, true) ?? {};
    filter.status = ordersFilter.status;
    if(selected?.length) {
      filter.sgOrderId = selected;
    }
    const request: OrderListRequest = { filter, sort: { ...defaultSort, ...sort } };
    return xslxExport({
      request, http: this.http, url: `${this.config.api.customerUrl}/admin/export/order`, label: 'Orders', columns
    });
  }

  getOrder(sgOrderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.config.api.customerUrl}/admin/order/${sgOrderId}`);
  }

  createOrder(order: Order): Observable<Order> {
    // prepare order
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sgCompanyId, sgOrderId, ...newOrder } = this.sanitizeOrder(order);
    return this.http.post<Order>(`${this.config.api.customerUrl}/admin/company/${order.sgCompanyId}/order`, newOrder);
  }

  updateOrder(sgOrderId: string, updateOpts: UpdateOrderOpts): Observable<Order> {
    return this.http.patch<Order>(`${this.config.api.customerUrl}/admin/order/${sgOrderId}`, updateOpts);
  }

  transferOrder(sgOrderId: string, transferOpts: TransferOrderOpts): Observable<Order> {
    return this.http.patch<Order>(`${this.config.api.customerUrl}/admin/order/${sgOrderId}`, transferOpts);
  }

  /**
   * Remove parameters which cannot be processed by API and convert string to numbers
   */
  private sanitizeOrder(order: Order): Order {
    const newOrder = removeEmpty(order);
    newOrder.contacts = newOrder.contacts.map(contact => removeEmptyStrings(removeEmpty(contact)));

    if (!newOrder.orderTitle) {
      delete newOrder.orderTitle;
    }
    if (!newOrder.freeText) {
      delete newOrder.freeText;
    }
    if (!newOrder.purchaseOrderNo) {
      delete newOrder.purchaseOrderNo;
    }
    if (!newOrder.contractNo) {
      delete newOrder.contractNo;
    }

    // TODO don't use "delete"
    delete newOrder.deleted;

    if (newOrder.VAT_ID && newOrder.VAT_ID > 0) {
      newOrder.VAT_ID = parseInt(newOrder.VAT_ID + '', 10);
    } else {
      delete newOrder.VAT_ID;
    }

    if (order.discount && (order.discount.amount || order.discount.percent)) {
      if (order.discount.amount) {
        order.discount.amount = parseFloat(order.discount.amount + '');
        delete order.discount.percent;
      } else {
        order.discount.percent = parseFloat(order.discount.percent + '');
        delete order.discount.amount;
      }
    }

    newOrder.contacts.forEach(item => {
      removeEmpty(item);
    });

    newOrder.orderItems.forEach(item => {
      if (typeof item.price !== 'undefined') {
        item.price = parseFloat(item.price + '');
      }
      if (item.discount && (item.discount.amount || item.discount.percent)) {
        if (item.discount.amount) {
          item.discount.amount = parseFloat(item.discount.amount + '');
          delete item.discount.percent;
        } else {
          item.discount.percent = parseFloat(item.discount.percent + '');
          delete item.discount.amount;
        }
      } else {
        delete item.discount;
      }

      if (!item.memoField || item.memoField.length === 0) {
        delete item.memoField;
      }
    });
    return removeEmpty(newOrder, true, true, true);
  }
}
