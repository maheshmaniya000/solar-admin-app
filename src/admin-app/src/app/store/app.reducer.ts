import { ActionReducerMap } from '@ngrx/store';

import { State as UserState } from 'ng-shared/user/reducers';

import * as fromCompanies from '../companies/store/companies.reducer';
import * as fromInvoices from '../invoices/store/invoices.reducer';
import * as fromOrders from '../orders/store/orders.reducer';
import * as fromProducts from '../products/store/products.reducer';
import * as fromUsers from '../users/store/users.reducer';

export const featureKey = 'admin';

export interface AdminState {
  [fromCompanies.featureKey]: fromCompanies.State;
  [fromUsers.featureKey]: fromUsers.State;
  [fromProducts.featureKey]: fromProducts.State;
  [fromOrders.featureKey]: fromOrders.State;
  [fromInvoices.featureKey]: fromInvoices.State;
}

export const reducers: ActionReducerMap<AdminState> = {
  [fromCompanies.featureKey]: fromCompanies.reducers,
  [fromUsers.featureKey]: fromUsers.reducers,
  [fromProducts.featureKey]: fromProducts.reducers,
  [fromOrders.featureKey]: fromOrders.reducers,
  [fromInvoices.featureKey]: fromInvoices.reducers
};

export interface State extends UserState {
  [featureKey]: AdminState;
}
