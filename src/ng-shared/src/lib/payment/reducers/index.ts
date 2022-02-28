import { ActionReducerMap } from '@ngrx/store';

import { ShoppingCartOrder } from '@solargis/types/order-invoice';

import { State as UserState } from '../../user/reducers';
import { cartReducer } from './cart.reducer';

export interface PaymentState {
  cart: ShoppingCartOrder;
}

export interface State extends UserState {
  payment: PaymentState;
}

export const paymentReducer: ActionReducerMap<PaymentState> = {
  cart: cartReducer
};
