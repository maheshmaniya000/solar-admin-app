import { createSelector, select } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { getProjectPermissions, mergeCompanyTokenPermissions, mergePermissions } from '@solargis/types/permissions';
import { Project } from '@solargis/types/project';
import { CompanyTokenContent } from '@solargis/types/user-company';

import { State } from '../../core/reducers';
import { ConfigState } from '../../core/reducers/config.reducer';
import { selectConfigState } from '../../core/selectors/config.selector';
import { UserState } from '../types';
import { userSelector } from './auth.selectors';
import { activeCompanyTokenContentSelector } from './company.selectors';

export const userCompanyPermissionsSelector = createSelector(
  selectConfigState,
  userSelector,
  activeCompanyTokenContentSelector,
  (config: ConfigState, user: UserState, companyToken: CompanyTokenContent) => ({
    userPermissions: mergeCompanyTokenPermissions(config.env, user?.authorization?.permissions, companyToken),
    companyToken
  })
);

/**
 * Selects array of user permissions or empty array.
 *
 * Usage: permissions$: Observable<string[]> = store.pipe(selectUserPermissions)
 */
export const selectUserPermissions = pipe(
  select(userCompanyPermissionsSelector),
  map(({ userPermissions }) => userPermissions),
  // distinctUntilChanged((perm1, perm2) => perm1.join(',') === perm2.join(',')),
  shareReplay()
);

/**
 * Selects merged array of user permissions and project-specific permissions
 *
 * @param project
 */
export function selectProjectPermissions(project: Project): OperatorFunction<State, string[]> {
  return pipe(
    select(userCompanyPermissionsSelector),
    map(({ userPermissions, companyToken }) => {
      const projectPermissions = getProjectPermissions(project, companyToken);
      return mergePermissions(projectPermissions, userPermissions);
    }),
    distinctUntilChanged((p1, p2) => isEqual(p1, p2))
  );
}

/**
 * Selects true/false if user is logged as administrator.
 *
 * Usage: isAdmin$: Observable<boolean> = store.pipe(selectIsUserAdmin)
 */
export const selectIsUserAdmin = pipe(
  selectUserPermissions,
  map(permissions => permissions.includes('admin:all'))
);

export const selectHasUserCompareAccess = pipe(
  selectUserPermissions,
  map(permissions => permissions.includes('prospect:compare'))
);

export const selectHasUserCompareAccessAndToken = pipe(
  select(userCompanyPermissionsSelector),
  map(({ userPermissions, companyToken }) => ({
    hasUserCompare: userPermissions.includes('prospect:compare'),
    hasCompanyToken: !!companyToken
  }))
);
