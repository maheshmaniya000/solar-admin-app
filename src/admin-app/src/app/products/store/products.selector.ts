import { createSelector, MemoizedSelector } from '@ngrx/store';

import { Product } from '@solargis/types/customer';

import { multiselectSelectorFactory } from '../../shared/store/multiselect/multiselect.selector';
import { AdminSelectors, fromAdmin } from '../../store/';
import { adapter, selectId } from './products.reducer';

const selectProductsState = createSelector(AdminSelectors.selectAdminState, state => state.products);

export const { selectIds: selectCodes, selectEntities, selectAll, selectTotal } = adapter.getSelectors(selectProductsState);

const selectProductsFilter = createSelector(selectProductsState, state => state.filter);

export const selectIncludeDisabled = createSelector(selectProductsFilter, state => state.includeDisabled);

export const selectByCode = (code: string): MemoizedSelector<fromAdmin.State, Product> =>
  createSelector(selectAll, (products: Product[]) => products.find(product => selectId(product) === code));

export const selectSelected = createSelector(selectProductsState, state => state.selected);

export const { selectMultiselect, selectMultiselectActive } =
  multiselectSelectorFactory(selectProductsState);

export const selectAllSelected = createSelector(
  selectMultiselect,
  selectTotal,
  (multiselect, total) => multiselect.length === total && multiselect.length > 0
);


