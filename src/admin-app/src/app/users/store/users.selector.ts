import { createSelector, MemoizedSelector } from '@ngrx/store';

import { User } from '@solargis/types/user-company';

import { selectUserSettings } from 'ng-shared/user/selectors/auth.selectors';

import { multiselectSelectorFactory } from '../../shared/store/multiselect/multiselect.selector';
import { AdminSelectors, fromAdmin } from '../../store';
import { Users } from '../constants/users.constants';
import { adapter, selectId } from './users.reducer';

const selectUsersState = createSelector(AdminSelectors.selectAdminState, state => state.users);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors(selectUsersState);

export const selectDetail = createSelector(selectUsersState, state => state.detail);

export const selectFilter = createSelector(selectUsersState, state => state.filter);
const selectPageIndex = createSelector(selectUsersState, state => state.page.index);
export const selectPage = createSelector(AdminSelectors.selectAdminPageSize, selectPageIndex, (size, index) => ({
  size,
  index
}));
export const selectSort = createSelector(selectUsersState, state => state.sort);

export const selectFilterPageAndSort = createSelector(selectFilter, selectPage, selectSort, (filter, page, sort) => ({
  filter,
  page,
  sort
}));

export const selectTableSettings = createSelector(
  selectUserSettings,
  state => state?.tableView?.[Users.tableSettingsKey] ?? Users.defaultTableSettings
);

export const selectById = (id: string): MemoizedSelector<fromAdmin.State, User> =>
  createSelector(selectAll, (users: User[]) => users.find(user => selectId(user) === id));

export const { selectCount, selectMultiselect, selectAllSelected, selectMultiselectActive } =
  multiselectSelectorFactory(selectUsersState);
