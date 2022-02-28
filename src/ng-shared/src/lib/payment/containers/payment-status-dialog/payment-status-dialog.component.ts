import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Order } from '@solargis/types/customer';
import { OrderPaymentStatus, OrderPaymentType } from '@solargis/types/customer';

import { PaymentWrapperPage } from '../../components/payment-wrapper/payment-wrapper.component';
import { PaymentMethod } from '../../payment.types';

@Component({
  selector: 'sg-payment-status-dialog',
  templateUrl: './payment-status-dialog.component.html',
  styleUrls: ['../payment-dialog/payment-dialog.component.scss']
})
export class PaymentStatusDialogComponent {

  page: PaymentWrapperPage;
  paymentMethod: PaymentMethod;

  constructor(
    public dialogRef: MatDialogRef<PaymentStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public order: Order,
  ) {
    if (order.payment && order.payment.type === OrderPaymentType.BRAINTREE) {
      this.paymentMethod = 'card';
      this.page = order.payment.status === OrderPaymentStatus.PAID ? 'thank-you' : 'payment-failed';
    } else if (order.payment && order.payment.type === OrderPaymentType.BANK) {
      this.paymentMethod = 'bank';
      this.page = order.payment.status !== OrderPaymentStatus.PAYMENT_FAILED ? 'thank-you' : 'payment-failed';
    } else {
      throw new Error('Order is not paid');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
