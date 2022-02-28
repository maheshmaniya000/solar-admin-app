import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order } from '@solargis/types/customer';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';

import { selectUser } from '../../../user/selectors/auth.selectors';
import { selectActiveCompany } from '../../../user/selectors/company.selectors';
import { PaymentMethod } from '../../payment.types';
import { State } from '../../reducers';

export type PaymentWrapperPage = PaymentMethod | 'thank-you' | 'payment-failed' | 'loading';


@Component({
  selector: 'sg-payment-wrapper',
  templateUrl: './payment-wrapper.component.html',
  styleUrls: ['./payment-wrapper.component.scss']
})
export class PaymentWrapperComponent implements OnInit {

  @Input() order: Order;

  @Input() page: PaymentWrapperPage;
  @Output() pageChange = new EventEmitter<PaymentWrapperPage>();

  @Output() onFinish = new EventEmitter<string>();

  orderSumStr: string;

  sgAccountId$: Observable<string>;
  sgCompanyId$: Observable<string>;

  error = false;

  paymentMethod: PaymentMethod;

  constructor(
    private readonly store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.orderSumStr = this.order && `${this.order.price} ${this.order.currency}`;

    this.sgAccountId$ = this.store.pipe(
      selectUser,
      map(u => u.sgAccountId)
    );

    this.sgCompanyId$ = this.store.pipe(
      selectActiveCompany,
      map(c => c.sgCompanyId)
    );

    this.orderSumStr = this.order && `${this.order.price} ${this.order.currency}`;
  }

  onBraintreeSuccess(status: boolean): void {
    if (status) {this.setPage('thank-you');}
    else {this.setPage('payment-failed');}

    if (status) {
      this.store.dispatch(new AmplitudeTrackEvent('order_paid_braintree', { order: { sgOrderId: this.order.sgOrderId }}));
    }
  }

  setPage(page: PaymentWrapperPage): void {
    this.page = page;
    if (page === 'thank-you' || page === 'payment-failed') {this.onFinish.emit(this.order.sgOrderId);}
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod = method;
    this.page = method;
  }

}
