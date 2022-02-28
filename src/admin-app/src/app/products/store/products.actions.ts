import { createAction, props } from '@ngrx/store';

import { Product } from '@solargis/types/customer';

import { multiselectActionsFactory } from '../../shared/store/multiselect/multiselect.actions';

export const changeFilter = createAction('[Products] Change Filter', props<{ includeDisabled: boolean }>());
export const clearSelected = createAction('[Products] Clear Selected');
export const select = createAction('[Products] Select', props<{ product: Product }>());
export const updated = createAction('[Products] Updated', props<{ product: Product }>());

export const { multiselect, multiselectToggleAll, multiselectClear } = multiselectActionsFactory('Products');

export const loadProducts = createAction('[Products] Load');
export const loadProductsSuccess = createAction('[Products] Load Success', props<{ products: Product[] }>());
export const loadProductsFailure = createAction('[Products] Load Failure');

export const exportList = createAction('[Products] Export List');
