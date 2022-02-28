import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sg-payment-failed',
  templateUrl: './payment-failed.component.html',
  styleUrls: ['../payment-thank-you/payment-thank-you.component.scss']
})
export class PaymentFailedComponent {

  @Output() onClose = new EventEmitter<void>();

}
