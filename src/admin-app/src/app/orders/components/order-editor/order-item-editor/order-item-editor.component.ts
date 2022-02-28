import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { isNil }from 'lodash-es';
import { Unsubscribable } from 'rxjs';

import { OrderItem, Product } from '@solargis/types/customer';

import { OrderDetailStore } from '../../../services/order-detail.store';
import { OrderDiscountComponent } from '../order-discount/order-discount.component';

@Component({
  selector: 'sg-admin-order-item-editor',
  templateUrl: './order-item-editor.component.html',
  styleUrls: ['./order-item-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderItemEditorComponent {
  @Input() removable: boolean;
  @Input() index: number;
  @Input() products: Product[];
  @Input() parentForm: FormGroup;

  @Output() remove = new EventEmitter<number>();
  private readonly editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '30px',
    translate: 'no'
  };
  editorConfigENG = { ...this.editorConfig, placeholder: 'Description ENG*' };
  editorConfigSK = { ...this.editorConfig, placeholder: 'Description SK*' };

  constructor(readonly orderDetailStore: OrderDetailStore) {}

  static createFormGroup(): FormGroup {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      price: [null, [Validators.required]],
      basePrice: [null, [Validators.required]],
      quantity: [1, [Validators.required]],
      descriptionENG: [undefined, [Validators.required]],
      descriptionSK: [undefined, [Validators.required]],
      profaDescriptionENG: [undefined, []],
      profaDescriptionSK: [undefined, []],
      product: [undefined, [Validators.required]],
      discount: OrderDiscountComponent.createFormGroup(),
      memoField: [undefined, []],
      processed: fb.group({
        status: [null, []],
        updated: fb.group({
          ts: [null, []],
          user: fb.group({
            sgAccountId: [null, []],
            email: [null, []]
          })
        })
      }),
      originalProduct: [undefined]
    });
    formGroup.markAllAsTouched();
    return formGroup;
  }

  static addPriceCalculation(formGroup: FormGroup): Unsubscribable {
    return formGroup.valueChanges.subscribe((orderItem: OrderItem) => {
      formGroup.get('price').setValue(orderItem.basePrice * orderItem.quantity, { emitEvent: false });
    });
  }

  getSelectedProductCode(): string | undefined {
    return this.parentForm.get('product').value;
  }

  isProductSelected(): boolean {
    return !isNil(this.getSelectedProductCode());
  }

  onProductSelectionChanged(change: MatSelectChange): void {
    const product = this.products.find(item => item.code === change.value);
    if (product) {
      this.parentForm.patchValue({
        basePrice: isNil(product.price) ? undefined : +product.price,
        descriptionENG: product.descriptionENG,
        descriptionSK: product.descriptionSK
      });
    }
  }

  getDiscountFormGroup(): FormGroup {
    return this.parentForm.get('discount') as FormGroup;
  }
}
