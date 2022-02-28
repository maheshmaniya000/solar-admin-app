import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Product } from '@solargis/types/customer';

import { MultiselectState, multiselectReducerFactory } from '../../shared/store/multiselect/multiselect.reducer';
import {
  changeFilter,
  clearSelected,
  loadProductsSuccess,
  multiselect,
  multiselectClear,
  multiselectToggleAll,
  select,
  updated
} from './products.actions';

export const featureKey = 'products';

export interface State extends EntityState<Product>, MultiselectState {
  selected: Product | undefined;
  filter: {
    includeDisabled: boolean;
  };
}

const byProductCodeComparer = (a: Product, b: Product): number => a.code.localeCompare(b.code);

export const selectId = (product: Product): string | undefined => product?.code;

export const adapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId,
  sortComparer: byProductCodeComparer
});

const initialState: State = adapter.getInitialState({
  selected: undefined,
  multiselect: [],
  filter: {
    includeDisabled: false
  }
});

export const reducer = createReducer<State>(
  initialState,
  on(loadProductsSuccess, (state, { products }) => adapter.setAll(products, state)),
  on(clearSelected, state => ({
    ...state,
    selected: undefined
  })),
  on(select, (state, { product }) => ({
    ...state,
    selected: product
  })),
  on(changeFilter, (state, { includeDisabled }) => ({
    ...state,
    filter: { includeDisabled }
  })),
  on(updated, (state, { product }) =>
    adapter.updateOne(
      { id: selectId(product), changes: product },
      {
        ...state,
        selected: selectId(state.selected) === selectId(product) ? product : state.selected
      }
    )
  ),
  ...multiselectReducerFactory<State>(multiselect, multiselectClear, multiselectToggleAll)
);

export function reducers(state: State | undefined, action: Action): State {
  return reducer(state, action);
}
