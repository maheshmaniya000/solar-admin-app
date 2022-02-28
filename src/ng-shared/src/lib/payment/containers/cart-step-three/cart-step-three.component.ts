import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { Order } from '@solargis/types/customer';
import { round } from '@solargis/types/utils';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { PaymentService } from 'ng-shared/payment/services/payment.service';

import { ReloadCompanyList } from '../../../user/actions/company.actions';
import { selectActiveOrNoCompany } from '../../../user/selectors/company.selectors';
import { ClearCartAction } from '../../actions/cart.actions';
import { State } from '../../reducers';
import { selectCartProductVariants } from '../../selectors/cart.selectors';


@Component({
  selector: 'sg-cart-step-three',
  templateUrl: './cart-step-three.component.html',
  styleUrls: ['./cart-step-three.component.scss']
})
export class CartStepThreeComponent implements OnInit {

  order: Order;

  constructor(
    private readonly store: Store<State>,
    private readonly router: Router,
    private readonly paymentService: PaymentService,
  ) { }

  ngOnInit(): void {
    combineLatest(
      this.store.pipe(selectActiveOrNoCompany),
      this.store.pipe(selectCartProductVariants)
    ).pipe(
      first(),
      switchMap(([company, order]) => this.paymentService.createOrderFromCart(company.sgCompanyId, order))
    ).subscribe(order => {
      this.order = order;

      this.store.dispatch(
        new AmplitudeTrackEvent('order_created_from_cart', {
          order: { sgOrderId: order.sgOrderId },
          price: order.price,
          items: order.orderItems.map(i => i.descriptionENG)
        })
      );
    });
  }

  getVATprice(): number {
    return round((this.order.price / (this.order.VAT_ID + 100)) * this.order.VAT_ID, 2);
  }

  finish(sgOrderId: string): void {
    this.router.navigate(['/', 'company-admin', 'billing', 'order-detail', sgOrderId], {
      queryParams: {
        openPaymentStatus: true
      }
    });
    setTimeout(() => this.store.dispatch(new ClearCartAction()), 1500);
    // Not a good solution - reload company list after lambda processes new subscription
    setTimeout(() => this.store.dispatch(new ReloadCompanyList()), 10000);
  }
}
