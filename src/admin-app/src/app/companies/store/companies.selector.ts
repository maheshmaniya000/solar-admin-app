import { createSelector, MemoizedSelector } from '@ngrx/store';

import { Company } from '@solargis/types/user-company';

import { multiselectSelectorFactory } from '../../shared/store/multiselect/multiselect.selector';
import { AdminSelectors, fromAdmin } from '../../store';
import { adapter, selectId } from './companies.reducer';

const selectCompaniesState = createSelector(AdminSelectors.selectAdminState, state => state.companies);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors(selectCompaniesState);

export const selectSelected = createSelector(selectCompaniesState, state => state.selected);

export const selectFilter = createSelector(selectCompaniesState, state => state.filter);
const selectPageIndex = createSelector(selectCompaniesState, state => state.page.index);
export const selectPage = createSelector(AdminSelectors.selectAdminPageSize, selectPageIndex, (size, index) => ({ size, index }));
export const selectSort = createSelector(selectCompaniesState, state => state.sort);

export const selectFilterPageAndSort = createSelector(selectFilter, selectPage, selectSort, (filter, page, sort) => ({
  filter,
  page,
  sort
}));

export const selectById = (id: string): MemoizedSelector<fromAdmin.State, Company> =>
  createSelector(selectAll, (companies: Company[]) => companies.find(company => selectId(company) === id));

export const { selectCount, selectMultiselect, selectAllSelected, selectMultiselectActive } =
  multiselectSelectorFactory(selectCompaniesState);
