import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { OrderDetailStore } from '../../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-currency',
  templateUrl: './order-currency.component.html',
  styleUrls: ['./order-currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCurrencyComponent extends SubscriptionAutoCloseComponent implements OnInit {
  readonly customCurrency = 'custom';

  @Input() parentForm: FormGroup;
  selectedCurrency = '€';

  constructor(readonly orderDetailStore: OrderDetailStore) {
    super();
  }

  ngOnInit(): void {
    super.addSubscription(this.orderDetailStore.viewModel$.subscribe(viewModel => {
      this.selectedCurrency = viewModel.customCurrency ? this.customCurrency : viewModel.entity.currency;
    }));
  }

  onCurrencyChanged({ value }: MatSelectChange): void {
    if (value === this.customCurrency) {
      this.parentForm.patchValue({ currency: '' });
      this.parentForm.get('currency').markAsTouched();
    } else {
      this.parentForm.patchValue({ currency: value });
    }
  }

  isCustomCurrencyVisible(): boolean {
    return this.selectedCurrency === this.customCurrency;
  }
}
