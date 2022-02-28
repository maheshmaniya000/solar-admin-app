import { User } from '@solargis/types/user-company';

import {
  AUTH0_EMAIL_VERIFY,
  AUTH0_FORGOT_PASSWORD_CHANGE,
  AUTH0_FORGOT_PASSWORD_CHANGE_DONE,
  AUTH0_LOADING,
  AUTH0_LOGIN,
  AUTH0_LOGOUT,
  AUTH0_REFRESH_TOKENS,
  Auth0Actions,
  UPDATE_USER_SETTINGS,
  USER_DATA,
  USER_LOGIN,
  USER_LOGOUT,
  UserActions,
  UserDataActions
} from '../actions/auth.actions';
import { Auth0State, UserState } from '../types';

/**
 * Reducer for all Auth0 actions
 *
 * @param state
 * @param action
 * @returns
 */
export function auth0Reducer(state: Auth0State, action: Auth0Actions ): Auth0State {
  switch (action.type) {
    case AUTH0_EMAIL_VERIFY: {
      return { ...state, emailVerify: action.payload };
    }
    case AUTH0_REFRESH_TOKENS:
    case AUTH0_LOGIN: {
      return { ...state, tokens: action.payload, loading: true };
    }
    case AUTH0_LOGOUT: {
      return { ...state, tokens: null, loading: false };
    }
    case AUTH0_FORGOT_PASSWORD_CHANGE: {
      return { ...state, changePasswordToken: action.payload };
    }
    case AUTH0_FORGOT_PASSWORD_CHANGE_DONE: {
      return { ...state, changePasswordToken: null };
    }
    case AUTH0_LOADING: {
      return { ...state, loading: action.loading };
    }
  }

  return state;
}

/**
 * Reducer for all user actions
 *
 * @param state
 * @param action
 * @returns
 */
export function userReducer(state: UserState, action: UserActions ): UserState {
  switch (action.type) {
    case USER_LOGIN: {
      return action.payload;
    }
    case USER_LOGOUT: {
      return null;
    }
  }

  return state;
}

/**
 * Reducer for all user data (all user data from our database) actions
 */
export function userDataReducer(state: User, action: UserDataActions ): User {
  switch (action.type) {
    case USER_DATA: {
      return action.payload;
    }
    case UPDATE_USER_SETTINGS: {
      const currentSettings = state?.settings;
      const unitToggles = { ...currentSettings?.unitToggles, ...action.payload.unitToggles };
      const lang = action.payload.lang || currentSettings?.lang;
      const dateTimeFormat = action.payload.dateTimeFormat || currentSettings?.dateTimeFormat;
      const tableView = { ...currentSettings?.tableView, ...action.payload.tableView };
      return { ...state, settings: { unitToggles, lang, dateTimeFormat, tableView } };
    }
  }
  return state;
}
