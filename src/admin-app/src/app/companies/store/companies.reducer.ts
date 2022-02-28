import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Page, Sort } from '@solargis/types/api';
import { Company, CompanyListFilter } from '@solargis/types/user-company';

import { MultiselectState, multiselectReducerFactory } from '../../shared/store/multiselect/multiselect.reducer';
import {
  changeFilter,
  changePage,
  changeSort,
  clearSelected,
  companyUpdated,
  loadCompaniesSuccess,
  multiselect,
  multiselectClear,
  multiselectToggleAll,
  select
} from './companies.actions';

export const featureKey = 'companies';

export interface State extends EntityState<Company>, MultiselectState {
  selected?: Company;
  filter: CompanyListFilter;
  page: Pick<Page, 'index'>;
  sort: Sort;
}

export const selectId = (company: Company): string => company?.sgCompanyId;

export const adapter: EntityAdapter<Company> = createEntityAdapter<Company>({
  selectId
});

const initialState: State = adapter.getInitialState({
  selected: undefined,
  multiselect: [],
  filter: {
    nonHistoric: true,
    sg2Eligible: true
  },
  page: { index: 0 },
  sort: {
    sortBy: 'updated',
    direction: 'desc'
  }
});

export const reducer = createReducer<State>(
  initialState,
  on(changeFilter, (state, { filter }) => ({ ...state, page: { ...state.page, index: 0 }, filter: { ...state.filter, ...filter } })),
  on(changePage, (state, { page }) => ({ ...state, page })),
  on(changeSort, (state, { sort }) => ({ ...state, sort })),
  on(loadCompaniesSuccess, (state, { count, companies }) => adapter.setAll(companies, { ...state, count })),
  on(select, (state, { company }) => ({ ...state, selected: company })),
  on(companyUpdated, (state, { company }) => {
    const newState = {
      ...state,
      selected: selectId(state.selected) === selectId(company) ? company : state.selected
    };
    return adapter.updateOne({
      id: selectId(company),
      changes: company
    }, newState);
  }),
  on(clearSelected, state => ({ ...state, selected: undefined })),
  ...multiselectReducerFactory<State>(multiselect, multiselectClear, multiselectToggleAll),
);

export function reducers(state: State | undefined, action: Action): State {
  return reducer(state, action);
}
