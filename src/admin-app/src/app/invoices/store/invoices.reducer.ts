import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { merge } from 'lodash-es';

import { Page, Sort } from '@solargis/types/api';
import { InvoiceListFilter, InvoiceOrdersSummary, InvoiceType, InvoiceWithOrder } from '@solargis/types/customer';

import { MultiselectState, multiselectReducerFactory } from '../../shared/store/multiselect/multiselect.reducer';
import {
  changeFilter,
  changePage,
  changeSort,
  loadInvoicesSuccess,
  multiselect,
  multiselectClear,
  multiselectToggleAll
} from './invoices.actions';


export const featureKey = 'invoices';

export interface State extends EntityState<InvoiceWithOrder>, MultiselectState {
  filter: InvoiceListFilter;
  page: Pick<Page, 'index'>;
  sort: Sort;
  summary?: InvoiceOrdersSummary;
}

export const adapter: EntityAdapter<InvoiceWithOrder> = createEntityAdapter<InvoiceWithOrder>({
  selectId: entity => entity.invoiceCode,
});

const currentYear = new Date().getFullYear();

const initialState: State = adapter.getInitialState({
  filter: {
    type: InvoiceType.INVOICE,
    issueDate: [`${currentYear}-01-01`, `${currentYear}-12-31`] as any,
    order: {
      currency: '€',
    }
  },
  page: { index: 0 },
  sort: { sortBy: 'invoiceCode', direction: 'desc' },
  multiselect: [],
});

export const reducer = createReducer<State>(
  initialState,
  on(loadInvoicesSuccess, (state, { data, count, summary }) =>
    adapter.setAll(data, { ...state, count, summary })
  ),
  on(changeFilter, (state, { filter }) => ({ ...state, page: { ...state.page, index: 0 }, filter: merge({}, state.filter, filter) })),
  on(changePage, (state, { page }) => ({ ...state, page })),
  on(changeSort, (state, { sort }) => ({ ...state, sort })),
  ...multiselectReducerFactory<State>(multiselect, multiselectClear, multiselectToggleAll),
);

export function reducers(state: State | undefined, action: Action): State {
  return reducer(state, action);
}
