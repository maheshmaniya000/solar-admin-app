import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Page, Sort } from '@solargis/types/api';
import {
  CreateInvoiceInput,
  InvoiceHintResponse,
  InvoiceListFilter,
  InvoiceListRequest,
  InvoiceListResponse,
  InvoiceType,
  Order
} from '@solargis/types/customer';
import { removeEmpty } from '@solargis/types/utils';

import { Config } from 'ng-shared/config';
import { MimeType } from 'ng-shared/shared/utils/download.utils';

import { xslxExport } from '../admin.utils';

@Injectable({
  providedIn: 'root'
})
export class AdminInvoicesService {

  constructor(private readonly http: HttpClient, private readonly config: Config) { }

  deleteInvoice(sgOrderId: string, invoiceCode: string): Observable<Order> {
    return this.http.delete<Order>(
      `${this.config.api.customerUrl}/admin/order/${sgOrderId}/invoice/${invoiceCode}`
    );
  }

  createInvoice(sgOrderId: string, data: CreateInvoiceInput): Observable<Order> {
    return this.http.post<Order>(
      `${this.config.api.customerUrl}/admin/order/${sgOrderId}/invoice`, data
    );
  }

  updateInvoice(sgOrderId: string, invoiceCode: string, data: CreateInvoiceInput): Observable<Order> {
    return this.http.patch<Order>(
      `${this.config.api.customerUrl}/admin/order/${sgOrderId}/invoice/${invoiceCode}`, data
    );
  }

  downloadInvoice(sgCompanyId: string, sgOrderId: string, invoiceCode: string, noSign?: boolean): Observable<any> {
    return this.http.get(
      `${this.config.api.customerUrl}/company/${sgCompanyId}/order/${sgOrderId}/invoice/${invoiceCode}`,
      // @ts-ignore
      { responseType: 'arraybuffer', headers: { accept: MimeType.PDF }, params: removeEmpty({ noSign }) }
    );
  }

  listInvoices(filter: InvoiceListFilter = { order: { currency: '€' } }, page: Page, sort: Sort): Observable<InvoiceListResponse> {
    const request: InvoiceListRequest = removeEmpty({ filter, page, sort: sort?.sortBy ? sort : undefined }, true);
    return this.http.put<InvoiceListResponse>(`${this.config.api.customerUrl}/admin/invoice`, request);
  }

  exportInvoicesXlsx(
    filter: InvoiceListFilter = { order: { currency: '€' } },
    columns: string[],
    sort: Sort,
    selected?: string[]
  ): Observable<void> {
    const request: InvoiceListRequest = removeEmpty({ filter, sort: sort?.sortBy ? sort : undefined }, true);
    const invoiceType = Array.isArray(filter.type) ? filter.type[0] : filter.type;
    if (selected?.length) {
      request.filter.invoiceCode = selected;
    }
    return xslxExport({
      request, http: this.http, url: `${this.config.api.customerUrl}/admin/export/invoice`, label: `${invoiceType.toLowerCase()}s`, columns
    });
  }

  getInvoiceHint(sgOrderId: string, type: InvoiceType, date: string, currency: string): Observable<InvoiceHintResponse | null> {
    return this.http
      .get<InvoiceHintResponse>(`${this.config.api.customerUrl}/admin/order/${sgOrderId}/invoice-hint`, { params: { type, date, currency }})
      .pipe(
        catchError(() => of(null))
      );
  }
}
