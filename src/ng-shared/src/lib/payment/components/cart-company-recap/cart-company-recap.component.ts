import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { Company } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { selectActiveCompany } from '../../../user/selectors/company.selectors';
import { getBillingAddress } from '../../containers/cart-step-two/cart-step-two.component';


@Component({
  selector: 'sg-cart-company-recap',
  templateUrl: './cart-company-recap.component.html',
  styleUrls: ['./cart-company-recap.component.scss']
})
export class CartCompanyRecapComponent extends SubscriptionAutoCloseComponent implements OnInit {

  company: Company;

  getBillingAddress = getBillingAddress;

  constructor(
    private readonly store: Store<any>,
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.store.pipe(selectActiveCompany).subscribe(
        c => this.company = c
      )
    );
  }
}
