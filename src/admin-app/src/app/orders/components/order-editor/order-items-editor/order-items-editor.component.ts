import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { isEmpty } from 'lodash-es';
import { first, withLatestFrom } from 'rxjs/operators';

import { removeEmpty } from '@solargis/types/utils';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { OrderDetailStore } from '../../../services/order-detail.store';
import { OrderItemEditorComponent } from '../order-item-editor/order-item-editor.component';

@Component({
  selector: 'sg-admin-order-items-editor',
  templateUrl: './order-items-editor.component.html',
  styleUrls: ['./order-items-editor.component.scss']
})
export class OrderItemsEditorComponent extends SubscriptionAutoCloseComponent implements OnInit {
  @Input() formArray: FormArray;

  constructor(readonly orderDetailStore: OrderDetailStore) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.orderDetailStore.products$
        .pipe(withLatestFrom(this.orderDetailStore.viewModel$), first())
        .subscribe(([, { saved, entity: order }]) => {
          this.formArray.clear();
          if (!saved && isEmpty(order.orderItems)) {
            this.addOrderItem();
          } else {
            order.orderItems.forEach(orderItem => {
              const orderItemFormGroup = this.createOrderItemFormGroup();
              orderItemFormGroup.patchValue(removeEmpty({ ...orderItem }, true));
              this.formArray.push(orderItemFormGroup);
            });
          }
        })
    );
  }

  hasOrderItems(): boolean {
    return !isEmpty(this.formArray.controls);
  }

  removeOrderItem(index: number): void {
    if (this.canBeRemoved(index)) {
      this.formArray.removeAt(index);
    }
  }

  canBeRemoved(index: number): boolean {
    return this.formArray.length > 1 && this.formArray.length > index;
  }

  onRemove(index: number): void {
    if (this.canBeRemoved(index)) {
      this.formArray.removeAt(index);
    }
  }

  getOrderItemFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

  addOrderItem(): void {
    this.formArray.push(this.createOrderItemFormGroup());
  }

  private createOrderItemFormGroup(): FormGroup {
    const orderItemFormGroup = OrderItemEditorComponent.createFormGroup();
    this.addSubscription(OrderItemEditorComponent.addPriceCalculation(orderItemFormGroup));
    return orderItemFormGroup;
  }
}
