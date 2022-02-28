import { createAction, props } from '@ngrx/store';

import { Page, Sort } from '@solargis/types/api';
import { Order, OrderListFilter } from '@solargis/types/customer';

import { multiselectActionsFactory } from '../../shared/store/multiselect/multiselect.actions';

export const changeFilter = createAction('[Orders] Change Filter', props<{ filter: OrderListFilter }>());
export const clearFilter = createAction('[Orders] Clear Filter');
export const changePage = createAction('[Orders] Change Page', props<{ page: Page }>());
export const changeSort = createAction('[Orders] Change Sort', props<{ sort: Sort }>());
export const select = createAction('[Orders] Select', props<{ order: Order }>());

export const { multiselect, multiselectToggleAll, multiselectClear } = multiselectActionsFactory('Orders');

export const load = createAction('[Orders] Load');
export const updated = createAction('[Orders] Updated', props<{ order: Order }>());
export const loadSuccess = createAction('[Orders] Load Success', props<{ count: number; orders: Order[] }>());
export const loadFailure = createAction('[Orders] Load Failure');

export const exportList = createAction('[Orders] Export List');
