import { createSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { State } from '../reducers';
import { UserState } from '../types';

export const userSelector = createSelector((state: State) => state.user, user => user.user);
export const userDataSelector = createSelector((state: State) => state.user, user => user.userData);
export const auth0Selector = createSelector((state: State) => state.user, user => user.auth0);
export const userTokensSelector = createSelector((state: State) => state.user, user => user.auth0 && user.auth0.tokens);

/**
 * Selects current logged in user or undefined
 *
 * Usage: user$: Observable<UserState> = store.pipe(selectUser)
 */
export const selectUser = pipe(
  select(userSelector)
);

/**
 * Select user (full user) from database
 *
 * Usage: user$: Observable<User> = store.pipe(userDataSelector)
 */
export const selectUserData = pipe(
  select(userDataSelector)
);

export const selectUserSettings = createSelector(userDataSelector, state => state?.settings);

/**
 * Selects current logged in user as UserRef
 *
 * Usage: userRef$: Observable<UserRef> = store.pipe(selectUserRef)
 */
export const selectUserRef = pipe(
  selectUser,
  map((user: UserState) => user ? { sgAccountId: user.sgAccountId, email: user.email } : undefined)
);

/**
 * Selects true/false flag is user is logged in
 *
 * Usage: loggedIn$: Observable<boolean> = store.pipe(selectIsUserLogged)
 */
export const selectIsUserLogged = pipe(
  select(userSelector),
  map(user => !!user && !!user.sgAccountId)
);

export const waitUntilUserLogged = pipe(
  selectIsUserLogged,
  filter(x => !!x),
);

export const isUserLoading = pipe(
  select(auth0Selector),
  map(auth0 => auth0 && auth0.loading),
);
