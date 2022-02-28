import { ShoppingCartOrder } from '@solargis/types/order-invoice';

import { Actions, ADD_PRODUCT_TO_CART, CLEAR_CART, UPDATE_CART, UPDATE_CART_PRODUCT_VARIANT } from '../actions/cart.actions';


const initState: ShoppingCartOrder = {
  products: []
};

export function cartReducer(state: ShoppingCartOrder = initState, action: Actions): ShoppingCartOrder {
  switch (action.type) {
    case ADD_PRODUCT_TO_CART: {
      // we can add only one prospect product for a company
      // so we can drop other products in cart here
      // because for now, we can only add prospect products
      // TODO: after this module supports multiple products, fix this
      return {...state, products: [ action.payload ]};
    }
    case UPDATE_CART: {
      return { ...state, ...action.payload };
    }
    case UPDATE_CART_PRODUCT_VARIANT: {
      const products = [...state.products];
      products[action.index] = action.payload;
      return {...state, products };
    }
    case CLEAR_CART: {
      return initState;
    }
  }
  return state;
}
