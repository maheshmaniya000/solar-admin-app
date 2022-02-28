import { Action } from '@ngrx/store';

import { ShoppingCartOrder, ProductVariant } from '@solargis/types/order-invoice';

export const ADD_PRODUCT_TO_CART = '[cart] add product';
export const CLEAR_CART = '[cart] clear';
export const UPDATE_CART = '[cart] update';
export const UPDATE_CART_PRODUCT_VARIANT = '[cart] update product';


export class AddProductToCartAction implements Action {
  readonly type = ADD_PRODUCT_TO_CART;
  constructor(public payload: ProductVariant) {}
}

export class ClearCartAction implements Action {
  readonly type = CLEAR_CART;
}

export class UpdateCartAction implements Action {
  readonly type = UPDATE_CART;
  constructor(public payload: Partial<ShoppingCartOrder>) {}
}

export class UpdateProductVariantAction implements Action {
  readonly type = UPDATE_CART_PRODUCT_VARIANT;
  constructor(public index: number, public payload: ProductVariant) {}
}

export type Actions = AddProductToCartAction | ClearCartAction | UpdateCartAction | UpdateProductVariantAction;
