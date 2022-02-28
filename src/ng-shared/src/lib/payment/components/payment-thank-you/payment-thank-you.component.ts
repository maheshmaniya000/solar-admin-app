import { Component, Output, EventEmitter, Input } from '@angular/core';

import { PaymentMethod } from '../../payment.types';

@Component({
  selector: 'sg-payment-thank-you',
  templateUrl: './payment-thank-you.component.html',
  styleUrls: ['./payment-thank-you.component.scss']
})
export class PaymentThankYouComponent {

  @Input() paymentMethod: PaymentMethod = 'bank';
  @Output() onClose = new EventEmitter<void>();

}
