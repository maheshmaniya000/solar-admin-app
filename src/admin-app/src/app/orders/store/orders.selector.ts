import { createSelector, MemoizedSelector } from '@ngrx/store';

import { Order } from '@solargis/types/customer';

import { selectUserSettings } from 'ng-shared/user/selectors/auth.selectors';

import { multiselectSelectorFactory } from '../../shared/store/multiselect/multiselect.selector';
import { AdminSelectors, fromAdmin } from '../../store';
import { Orders } from '../constants/orders.constants';
import { adapter, selectId } from './orders.reducer';

const selectOrdersState = createSelector(AdminSelectors.selectAdminState, state => state.orders);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors(selectOrdersState);

export const selectFilter = createSelector(selectOrdersState, state => state.filter);
const selectPageIndex = createSelector(selectOrdersState, state => state.page.index);
export const selectPage = createSelector(AdminSelectors.selectAdminPageSize, selectPageIndex,
  (size, index) => ({ size, index })
);
export const selectSort = createSelector(selectOrdersState, state => state.sort);
export const selectFilterPageAndSort = createSelector(
  selectFilter, selectPage, selectSort,
  (filter, page, sort) => ({ filter, page, sort })
);
export const selectSelected = createSelector(selectOrdersState, state => state.selected);
export const selectTableSettings = createSelector(
  selectUserSettings,
  state => state?.tableView?.[Orders.tableSettingsKey] ?? Orders.defaultTableSettings
);
export const selectById = (id: string): MemoizedSelector<fromAdmin.State, Order> =>
  createSelector(selectAll, (orders: Order[]) => orders.find(order => selectId(order) === id));

export const { selectCount, selectMultiselect, selectAllSelected, selectMultiselectActive } =
  multiselectSelectorFactory(selectOrdersState);
