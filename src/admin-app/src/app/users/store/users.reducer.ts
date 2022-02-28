import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Page, Sort } from '@solargis/types/api';
import { User, UserListFilter } from '@solargis/types/user-company';

import { multiselectReducerFactory, MultiselectState } from '../../shared/store/multiselect/multiselect.reducer';
import {
  changeFilter,
  changePage,
  changeSort,
  loadDetailSuccess,
  loadSuccess,
  multiselect,
  multiselectClear,
  multiselectToggleAll,
  update
} from './users.actions';

export const featureKey = 'users';

export interface State extends EntityState<User>, MultiselectState {
  detail?: User;
  filter: UserListFilter;
  page: Pick<Page, 'index'>;
  sort: Sort;
}

export const selectId = (user: User | undefined): string | undefined => user?.sgAccountId;

export const adapter = createEntityAdapter<User>({ selectId });

export const initialFilter: UserListFilter = {
  deleted: false
};

const initialState: State = adapter.getInitialState({
  filter: initialFilter,
  multiselect: [],
  sort: {
    sortBy: 'updated',
    direction: 'desc'
  },
  page: { index: 0 }
});

export const reducer = createReducer<State>(
  initialState,
  on(changeFilter, (state, { filter }) => ({
    ...state,
    page: { ...state.page, index: 0 },
    filter: { ...state.filter, ...filter }
  })),
  on(changePage, (state, { page }) => ({ ...state, page })),
  on(changeSort, (state, { sort }) => ({ ...state, sort })),
  on(loadSuccess, (state, { count, users }) => adapter.setAll(users, { ...state, count })),
  on(loadDetailSuccess, (state, { user }) => ({ ...state, detail: user })),
  on(update, (state, { user }) => {
    const newState = {
      ...state,
      detail: selectId(state.detail) === selectId(user) ? user : state.detail
    };
    return adapter.updateOne(
      {
        id: selectId(user),
        changes: user
      },
      newState
    );
  }),
  ...multiselectReducerFactory<State>(multiselect, multiselectClear, multiselectToggleAll)
);

export function reducers(state: State | undefined, action: Action): State {
  return reducer(state, action);
}
