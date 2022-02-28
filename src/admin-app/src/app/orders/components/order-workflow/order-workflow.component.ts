import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

import { OrderPayment, OrderPaymentStatus, OrderPaymentType } from '@solargis/types/customer';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { OrderDetailStore } from '../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-workflow',
  templateUrl: './order-workflow.component.html',
  styleUrls: ['./order-workflow.component.scss']
})
export class OrderWorkflowComponent extends SubscriptionAutoCloseComponent implements OnInit {
  orderPaymentType = OrderPaymentType;
  orderPaymentStatus = OrderPaymentStatus;
  formGroup: FormGroup;

  constructor(readonly orderDetailStore: OrderDetailStore) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.orderDetailStore.setPaymentValid(this.formGroup.statusChanges.pipe(map(status => status === 'VALID')));
    this.addSubscription(this.orderDetailStore.entity$.subscribe(order => this.formGroup.patchValue(order.payment, { emitEvent: false })));
    this.addSubscription(
      this.formGroup.valueChanges.subscribe(() => this.orderDetailStore.setUnsavedEntity({ payment: this.getFormValue() }))
    );
  }

  onOrderDoneChanged(isOrderDoneChange: boolean): void {
    if (isOrderDoneChange) {
      this.orderDetailStore.changeStatus('DONE');
    }
  }

  private createForm(): void {
    this.formGroup = new FormBuilder().group({
      status: [undefined, [Validators.required]],
      type: [undefined, [Validators.required]],
      paymentDate: [null, []]
    });
  }

  private getFormValue(): OrderPayment {
    return this.formGroup.value;
  }
}
