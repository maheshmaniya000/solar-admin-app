import { createSelector } from '@ngrx/store';

import { InvoiceType } from '@solargis/types/customer';
import { removeEmpty } from '@solargis/types/utils';

import { selectUserSettings } from 'ng-shared/user/selectors/auth.selectors';

import { multiselectSelectorFactory } from '../../shared/store/multiselect/multiselect.selector';
import { AdminSelectors } from '../../store';
import { Invoices } from '../constants/invoice.constants';
import * as fromInvoices from './invoices.reducer';

const selectInvoicesState = createSelector(AdminSelectors.selectAdminState, state => state.invoices);

export const { selectIds, selectEntities, selectAll, selectTotal } = fromInvoices.adapter.getSelectors(selectInvoicesState);

export const selectFilter = createSelector(selectInvoicesState, state => state.filter);
const selectPageIndex = createSelector(selectInvoicesState, state => state.page.index);
export const selectPage = createSelector(AdminSelectors.selectAdminPageSize, selectPageIndex, (size, index) => ({ size, index }));
export const selectSort = createSelector(selectInvoicesState, state => state.sort);
export const selectFilterPageAndSort = createSelector(selectFilter, selectPage, selectSort, (filter, page, sort) => ({
  filter: removeEmpty({
    ...filter,
    // add INVOICE_FOR_PROFA when searching for INVOICE
    type: filter.type === InvoiceType.INVOICE ? [filter.type, InvoiceType.INVOICE_FOR_PROFA] : filter.type
  }),
  page,
  sort
}));

export const selectSummary = createSelector(selectInvoicesState, state => state.summary);

export const selectFilterCurrency = createSelector(selectFilter, state => state.order.currency);
export const selectFilterInvoiceType = createSelector(selectFilter, state => // just for type safety
  Array.isArray(state.type) ? state.type[0] : state.type                     // actually we have no array values of type in the store
);

export const { selectCount, selectMultiselect, selectAllSelected, selectMultiselectActive } =
  multiselectSelectorFactory(selectInvoicesState);


export const selectTableSettings = createSelector(
  selectUserSettings,
  state => state?.tableView?.[Invoices.tableSettingsKey] ?? Invoices.defaultTableSettings
);
