import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Page, Sort } from '@solargis/types/api';
import { Order, OrderListFilter } from '@solargis/types/customer';

import { MultiselectState, multiselectReducerFactory } from '../../shared/store/multiselect/multiselect.reducer';
import {
  changeFilter, changePage, changeSort, clearFilter, loadSuccess,
  multiselect, multiselectClear, multiselectToggleAll, select, updated
} from './orders.actions';


export const featureKey = 'orders';

export interface State extends EntityState<Order>, MultiselectState {
  selected?: Order;
  filter: OrderListFilter;
  page: Pick<Page, 'index'>;
  sort: Sort;
}

export const selectId = (order: Order): string | undefined => order?.sgOrderId;

export const adapter: EntityAdapter<Order> = createEntityAdapter<Order>({
  selectId
});

export const initialFilter: OrderListFilter = {
  status: { status: ['USER_STARTED', 'IN_PROGRESS', 'DONE', 'CANCELED', 'EXPIRED', null] }
};

const initialState: State = adapter.getInitialState({
  filter: initialFilter,
  sort: {
    sortBy: 'updated.ts',
    direction: 'desc'
  },
  page: { index: 0 },
  multiselect: [],
});

export const reducer = createReducer<State>(
  initialState,
  on(changeFilter, (state, { filter }) => ({ ...state, page: { ...state.page, index: 0 }, filter: { ...state.filter, ...filter } })),
  on(clearFilter, state => ({ ...state, filter: initialFilter })),
  on(changePage, (state, { page }) => ({ ...state, page })),
  on(changeSort, (state, { sort }) => ({ ...state, sort })),
  on(select, (state, { order }) => ({ ...state, selected: order })),
  on(loadSuccess, (state, { count, orders }) => adapter.setAll(orders, { ...state, count })),
  on(updated, (state, { order }) => {
    const newState = {
      ...state,
      selected: selectId(state.selected) === selectId(order) ? order : state.selected
    };
    return adapter.updateOne({
      id: selectId(order),
      changes: order
    }, newState);
  }),
  ...multiselectReducerFactory<State>(multiselect, multiselectClear, multiselectToggleAll),
);

export function reducers(state: State | undefined, action: Action): State {
  return reducer(state, action);
}
