import { Component, EventEmitter, Output } from '@angular/core';

import { PaymentMethod } from '../../payment.types';

@Component({
  selector: 'sg-select-payment-method',
  templateUrl: './select-payment-method.component.html',
  styleUrls: ['./select-payment-method.component.scss']
})
export class SelectPaymentMethodComponent {

  @Output() onSelect = new EventEmitter<PaymentMethod>();

}
