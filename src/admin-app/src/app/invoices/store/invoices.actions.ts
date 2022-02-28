import { createAction, props } from '@ngrx/store';

import { Page, Sort } from '@solargis/types/api';
import { InvoiceListFilter, InvoiceListResponse, OrderWithoutInvoices } from '@solargis/types/customer';

import { multiselectActionsFactory } from '../../shared/store/multiselect/multiselect.actions';

export const changeFilter = createAction('[Invoices] Change Filter', props<{ filter: Partial<InvoiceListFilter> }>());
export const changePage = createAction('[Invoices] Change Page', props<{ page: Page }>());
export const changeSort = createAction('[Invoices] Change Sort', props<{ sort: Sort }>());

export const { multiselect, multiselectToggleAll, multiselectClear } = multiselectActionsFactory('Invoices');

export const loadInvoices = createAction('[Invoices] Load');
export const loadInvoicesSuccess = createAction('[Invoices] Load Success', props<InvoiceListResponse>());
export const loadInvoicesFailure = createAction('[Invoices] Load Failure');

export const editNote = createAction('[Invoices] Edit Note', props<{ order: OrderWithoutInvoices; note: string }>());

export const exportList = createAction('[Invoices] Export List');
