import { createAction, props } from '@ngrx/store';

import { Page, Sort } from '@solargis/types/api';
import { User, UserListFilter } from '@solargis/types/user-company';

import { multiselectActionsFactory } from '../../shared/store/multiselect/multiselect.actions';

export const changeFilter = createAction('[Users] Change Filter', props<{ filter: UserListFilter }>());
export const changePage = createAction('[Users] Change Page', props<{ page: Page }>());
export const changeSort = createAction('[Users] Change Sort', props<{ sort: Sort }>());

export const update = createAction('[Users] Update', props<{ user: User }>());
export const load = createAction('[Users] Load');
export const loadSuccess = createAction('[Users] Load Success', props<{ count: number; users: User[] }>());
export const loadFailure = createAction('[Users] Load Failure');

export const loadDetail = createAction('[Users] Load Detail', props<{ sgAccountId: string }>());
export const loadDetailSuccess = createAction('[Users] Load Detail Success', props<{ user: User }>());
export const loadDetailFailure = createAction('[Users] Load Detail Failure', props<{ sgAccountId: string }>());

export const { multiselect, multiselectToggleAll, multiselectClear } = multiselectActionsFactory('Users');
export const exportList = createAction('[Users] Export List');
