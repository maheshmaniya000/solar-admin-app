import { Component, Output, EventEmitter, Input } from '@angular/core';
import { first } from 'rxjs/operators';

import { OrderPaymentType } from '@solargis/types/customer';

import { PaymentService } from '../../services/payment.service';


@Component({
  selector: 'sg-bank-transfer-payment',
  templateUrl: './bank-transfer-payment.component.html',
  styleUrls: ['./bank-transfer-payment.component.scss']
})
export class BankTransferPaymentComponent {

  @Input() sgAccountId: string;
  @Input() sgOrderId: string;
  @Input() sgCompanyId: string;
  @Input() price: string;

  @Output() onSuccess = new EventEmitter<void>();
  @Output() onChangeMethod = new EventEmitter<void>();

  working = false;

  constructor(
    public paymentService: PaymentService
  ) { }

  confirm(): void {
    this.working = true;
    this.paymentService.payOrder(this.sgAccountId, this.sgCompanyId, this.sgOrderId, OrderPaymentType.BANK).pipe(
      first()
    ).subscribe(() => {
      this.onSuccess.emit();
      this.working = false;
    });
  }
}
