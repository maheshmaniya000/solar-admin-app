import { Action } from '@ngrx/store';

import { User } from '@solargis/types/user-company';
import { UserSettings } from '@solargis/types/user-company';

import { TableView, Tokens, UserState } from '../types';

export const AUTH0_EMAIL_VERIFY = '[auth0] email verify';
export const AUTH0_TOKENS_FOUND = '[auth0] tokens found';
export const AUTH0_LOADING = '[auth0] loading tokens';
export const AUTH0_LOGIN = '[auth0] user login';
export const AUTH0_LOGOUT = '[auth0] user logout';
export const AUTH0_FORGOT_PASSWORD_CHANGE = '[auth0] forgot password change';
export const AUTH0_FORGOT_PASSWORD_CHANGE_DONE = '[auth0] forgot password change done';
export const AUTH0_REFRESH_TOKENS = '[auth0] refresh tokens';

export const USER_LOGIN = '[user] user login';
export const USER_DATA = '[user] user data';
export const USER_RELOAD_DATA = '[user] reload data';
export const USER_LOGOUT = '[user] user logout';

export const OPEN_USER_REGISTRATION = '[user] open registration dialog';
export const REQUIRE_USER_LOGIN = '[user] require user login';

export const UPDATE_USER_SETTINGS = '[user] update settings';

export const TABLE_VIEW_CHANGE = '[user] table view change';

/**
 * User registration - when user confirm registration in email, in this state is stored if
 * email verification if ok / not ok
 */
export class Auth0EmailVerify implements Action {
  readonly type = AUTH0_EMAIL_VERIFY;
  constructor(public payload: boolean) {}
}

/**
 * When loading tokens on app init
 */
export class Auth0TokensFound implements Action {
  readonly type = AUTH0_TOKENS_FOUND;
  constructor(public tokens: Tokens) {}
}

/**
 * Loading tokens toggle
 */
export class Auth0SetLoadingDataInProgress implements Action {
  readonly type = AUTH0_LOADING;
  constructor(public loading: boolean = true) {}
}

/**
 * When user successful logged with Auth0
 */
export class Auth0Login implements Action {
  readonly type = AUTH0_LOGIN;
  constructor(public payload: Tokens, public afterSuccessAction?: Action) {}
}

/**
 * Refresh User tokens
 */
export class Auth0RefreshTokens implements Action {
  readonly type = AUTH0_REFRESH_TOKENS;
  constructor(public payload: Tokens) {}
}

/**
 * When user log out with Auth0 (delete auth0 tokens)
 */
export class Auth0Logout implements Action {
  readonly type = AUTH0_LOGOUT;
}

/**
 * When user want to reset password and open page with token in url
 */
export class Auth0ForgotPasswordChange implements Action {
  readonly type = AUTH0_FORGOT_PASSWORD_CHANGE;
  constructor(public payload: string) {}
}

/**
 * When user finished reset password - clean store
 */
export class Auth0ForgotPasswordChangeDone implements Action {
  readonly type = AUTH0_FORGOT_PASSWORD_CHANGE_DONE;
}

/**
 * When user log into application (does not matter if through Auth0, ...)
 */
export class UserLogin implements Action {
  readonly type = USER_LOGIN;
  constructor(public payload: UserState) {}
}

/**
 * When user log out of application
 */
export class UserLogout implements Action {
  readonly type = USER_LOGOUT;
}

/**
 * When use log in, this action with all user data should be called
 */
export class UserData implements Action {
  readonly type = USER_DATA;
  constructor(public payload: User) {}
}

/**
 * Action to reload user data e.g. firstName, lastName, ...
 */
export class UserReloadData implements Action {
  readonly type = USER_RELOAD_DATA;
}

/**
 * Checks if user is signed in and if not, performs sign in. Afterwards callback action is dispatched.
 */
export class RequireUserLogin implements Action {
  readonly type = REQUIRE_USER_LOGIN;
  constructor(public next: Action) {}
}

/**
 * Open login dialog
 */
export class OpenUserRegistration implements Action {
  readonly type = OPEN_USER_REGISTRATION;
}

/**
 * Update user settings - e.g. language, unit toggle
 */
export class UpdateUserSettings implements Action {
  readonly type = UPDATE_USER_SETTINGS;
  constructor(public payload: UserSettings) {}
}

export class TableViewChange implements Action {
  readonly type = TABLE_VIEW_CHANGE;
  constructor(public payload: TableView, public save: boolean = true) {}
}

export type Auth0Actions =
  | Auth0EmailVerify
  | Auth0Login
  | Auth0Logout
  | Auth0ForgotPasswordChange
  | Auth0ForgotPasswordChangeDone
  | Auth0RefreshTokens
  | Auth0SetLoadingDataInProgress
  | Auth0TokensFound;

export type UserActions = UserLogin | UserLogout;
export type UserDataActions = UserData | UpdateUserSettings;
