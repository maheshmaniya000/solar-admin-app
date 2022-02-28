/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Order, OrderPaymentType } from '@solargis/types/customer';
import { ShoppingCartOrder } from '@solargis/types/order-invoice';
import { Country } from '@solargis/types/user-company';

import { Config } from '../../config';
import { FUPHttpClientService } from '../../fup/services/fup-http-client.service';


@Injectable()
export class PaymentService {

  countries$: Observable<Country[]>;

  constructor(
    private readonly http: FUPHttpClientService,
    private readonly config: Config
  ) { }

  getClientToken(sgAccountId: string, sgCompanyId: string, sgOrderId: string): Observable<string> {
    // TODO: not implemented
    throw new Error('NOT IMPLEMENTED!');
    // return this.http
    //   .get(`${this.config.api.orderInvoiceUrl}/payment/${sgAccountId}/${sgCompanyId}/${sgOrderId}`)
    //   .pipe(map(result => result.token));
  }

  payOrder(sgAccountId: string,
    sgCompanyId: string,
    sgOrderId: string,
    paymentMethodType: OrderPaymentType,
    paymentMethodNonce?: string): Observable<boolean>  {
    // TODO: not implemented
    throw new Error('NOT IMPLEMENTED!');
    // return this.http.post(
    //   `${this.config.api.orderInvoiceUrl}/payment/${sgAccountId}/${sgCompanyId}/${sgOrderId}`,
    //   { paymentMethodType, paymentMethodNonce }
    // );
  }

  createOrderFromCart(sgCompanyId: string, cart: ShoppingCartOrder): Observable<Order> {
    // TODO: not implemented
    throw new Error('NOT IMPLEMENTED!');
    // return this.http.post(
    //   `${this.config.api.customerUrl}/company/${sgCompanyId}/order`,
    //   cart
    // ).pipe(tap(console.log)) as Observable<Order>;
  }
}
