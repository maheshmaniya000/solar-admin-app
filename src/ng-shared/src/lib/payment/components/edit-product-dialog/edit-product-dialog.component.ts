import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Product } from '@solargis/types/customer';
import { ProductVariant } from '@solargis/types/order-invoice';

import { getProductUsersPrice, getproductVariantPrice } from '../../utils/price.utils';
import { getProductNameTranslation } from '../../utils/products.utils';

export type EditProductDialogInput = {
  product: Product;
  productVariant: ProductVariant;
};


@Component({
  selector: 'sg-edit-product-dialog',
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.scss']
})
export class EditProductDialogComponent {

  product: Product;
  productVariant: ProductVariant;

  totalUsers: number;
  MIN_USERS = 3;
  MAX_USERS = 99;

  getProductNameTranslation = getProductNameTranslation;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditProductDialogInput,
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
  ) {
    this.product = data.product;
    this.productVariant = data.productVariant;
    this.MIN_USERS = data.product.techSpec.autoProcessDefinition.usersLimit;
    this.totalUsers = data.productVariant.totalUsers || data.product.techSpec.autoProcessDefinition.usersLimit;
  }

  close(save: boolean): void {
    if (save) { this.dialogRef.close(this.getResult()); }
    else { this.dialogRef.close(); }
  }

  getResult(): ProductVariant {
    return { ...this.productVariant, totalUsers: this.totalUsers };
  }

  addUser(): void {
    this.totalUsers = Math.min(this.totalUsers + 1, this.MAX_USERS);
  }

  removeUser(): void {
    this.totalUsers = Math.max(this.MIN_USERS, this.totalUsers - 1);
  }

  priceForUsers(): number {
    return getProductUsersPrice(this.getResult(), this.product);
  }

  totalPrice(): number {
    return getproductVariantPrice(this.getResult(), this.product);
  }
}
