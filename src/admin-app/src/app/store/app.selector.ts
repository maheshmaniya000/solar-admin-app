import { createFeatureSelector, createSelector } from '@ngrx/store';

import { selectUserSettings } from 'ng-shared/user/selectors/auth.selectors';

import * as fromAdmin from './app.reducer';

const defaultPageSize = 50;

export const selectAdminState = createFeatureSelector<fromAdmin.State, fromAdmin.AdminState>(fromAdmin.featureKey);

export const selectAdminPageSize = createSelector(
  selectUserSettings,
  state => state?.tableView?.adminAll?.pageSize ?? defaultPageSize
);

