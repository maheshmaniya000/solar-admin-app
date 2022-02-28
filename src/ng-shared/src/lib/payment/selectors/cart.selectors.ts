import { createSelector, select } from '@ngrx/store';

import { ShoppingCartOrder } from '@solargis/types/order-invoice';

import { State } from '../reducers';

const cartProductVariants = (state: State): ShoppingCartOrder => state.payment.cart;
export const selectCartProductVariants = select(createSelector(cartProductVariants, cart => cart));
