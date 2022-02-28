import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Order } from '@solargis/types/customer';


@Component({
  selector: 'sg-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {

  order: Order;
  orderSumStr: string;

  finished = false;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: Order },
  ) {
    this.order = data.order;
    this.orderSumStr = `${this.order.price} ${this.order.currency}`;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
