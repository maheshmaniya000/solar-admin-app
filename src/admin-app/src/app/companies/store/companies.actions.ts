import { createAction, props } from '@ngrx/store';

import { Page, Sort } from '@solargis/types/api';
import { Company, CompanyListFilter } from '@solargis/types/user-company';

import { multiselectActionsFactory } from '../../shared/store/multiselect/multiselect.actions';

export const changeFilter = createAction('[Companies] Change Filter', props<{ filter: CompanyListFilter }>());
export const changePage = createAction('[Companies] Change Page', props<{ page: Page }>());
export const changeSort = createAction('[Companies] Change Sort', props<{ sort: Sort }>());

export const select = createAction('[Companies] Select', props<{ company: Company }>());
export const clearSelected = createAction('[Companies] Clear Selected');

export const { multiselect, multiselectToggleAll, multiselectClear } = multiselectActionsFactory('Companies');

export const loadCompanies = createAction('[Companies] Load');
export const companyUpdated = createAction('[Companies] Updated', props<{ company: Company }>());
export const loadCompaniesSuccess = createAction('[Companies] Load Success', props<{ count: number; companies: Company[] }>());
export const loadCompaniesFailure = createAction('[Companies] Load Failure');

export const exportList = createAction('[Companies] Export List');
