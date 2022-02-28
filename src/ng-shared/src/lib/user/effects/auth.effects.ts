import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as jwt_decode from 'jwt-decode';
import { merge, of, zip } from 'rxjs';
import { catchError, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Config } from 'ng-shared/config';
import { isTokensExpired } from 'ng-shared/user-shared/user-shared.utils';

import { AFTER_BOOTSTRAP } from '../../core/actions/bootstrap.action';
import { SettingsDateTimeFormat, SettingsToggles, SettingsTranslateLang } from '../../core/actions/settings.actions';
import { StorageProviderService } from '../../core/services/storage-provider.service';
import {
  Auth0Login,
  Auth0Logout,
  Auth0RefreshTokens,
  Auth0SetLoadingDataInProgress,
  Auth0TokensFound,
  AUTH0_LOGIN,
  AUTH0_LOGOUT,
  AUTH0_REFRESH_TOKENS,
  AUTH0_TOKENS_FOUND,
  OpenUserRegistration,
  OPEN_USER_REGISTRATION,
  RequireUserLogin,
  REQUIRE_USER_LOGIN,
  TableViewChange,
  UserData,
  UserLogin,
  UserLogout
} from '../actions/auth.actions';
import { StoreCompanyList } from '../actions/company.actions';
import { State } from '../reducers';
import { selectIsUserLogged } from '../selectors/auth.selectors';
import { Auth0Service } from '../services/auth0.service';
import { AuthenticationService } from '../services/authentication.service';
import { CompanyService } from '../services/company.service';
import { UserService } from '../services/user.service';
import { Tokens, UserState } from '../types';

@Injectable()
export class AuthEffects {

  private readonly storage: Storage;

  @Effect()
  loadTokensFromStorage$ = this.actions$.pipe(
    ofType(AFTER_BOOTSTRAP),
    switchMap(() => {
      const tokens = this.storage.getItem('tokens');
      try {
        const parsedTokens: Tokens = JSON.parse(tokens);
        if (parsedTokens) {
          return [
            new Auth0SetLoadingDataInProgress(true),
            new Auth0TokensFound(parsedTokens)
          ];
        }
      } catch (e) {
        // silently ignore (covering also 'undefined')
      }
      return [];
    })
  );

  @Effect()
  tokensFound$ = this.actions$.pipe(
    ofType<Auth0TokensFound>(AUTH0_TOKENS_FOUND),
    map(action => action.tokens),
    switchMap(tokens => {
      if (tokens.idToken && !isTokensExpired(tokens)) {
        return [new Auth0Login(tokens)];
      } else if (tokens.sgRefreshToken) {
        return this.auth0Service.refreshLogin(tokens).pipe(
          map(loginResult => {
            if (loginResult.tokens?.idToken) {return new Auth0Login(loginResult.tokens);}
            else {return new Auth0SetLoadingDataInProgress(false);}
          }),
          catchError(() => of(new Auth0SetLoadingDataInProgress(false)))
        );
      } else {
        return [new Auth0SetLoadingDataInProgress(false)];
      }
    })
  );

  @Effect()
  auth0Login$ = this.actions$.pipe(
    ofType<Auth0Login>(AUTH0_LOGIN),
    map(action => {
      const decodedIdToken = jwt_decode(action.payload.idToken);

      const claim = decodedIdToken[this.config.auth0.customNamespace];

      const termsConfirm = !(
        claim.app_metadata &&
        claim.app_metadata.sg1_login_sg2_terms_confirmed === false
      );

      const userState: UserState = {
        sgAccountId: decodedIdToken.sub,
        email: decodedIdToken.email,
        authorization: claim && claim.app_metadata && claim.app_metadata.authorization,
        sg1LoginSG2TermsConfirmed: termsConfirm
      };

      const userLoginAction = new UserLogin(userState);

      return {
        sgAccountId: decodedIdToken.sub,
        userLoginAction,
        afterSuccessAction: action.afterSuccessAction
      };
    }),
    switchMap(
      (data: { sgAccountId: string; userLoginAction: Action; afterSuccessAction: Action }) =>
        zip(
          this.companyService.listCompanies(),
          this.userService.getUserInfo(data.sgAccountId)
        ).pipe(
          map(([companies, user]) => ({ ...data, user, companies }))
        )
    ),
    switchMap(data => {
      let actions: Action[] = [
        data.userLoginAction,
        new StoreCompanyList(data.companies, data.user.selectedSgCompanyId),
        new UserData(data.user),
        new Auth0SetLoadingDataInProgress(false)
      ];

      if (data.user.settings) {
        const { lang, unitToggles, dateTimeFormat, tableView } = data.user.settings;
        if (lang) {actions = [...actions, new SettingsTranslateLang(lang, false)];}
        if (dateTimeFormat) {actions = [...actions, new SettingsDateTimeFormat(dateTimeFormat, false)];}
        if (unitToggles) {
          const toggles = Object.entries(unitToggles).map(
            ([key, elem]) => ({ settingsKey: key, toggleKey: elem })
          );
          actions = [...actions, new SettingsToggles(toggles as [{ settingsKey: string; toggleKey: string }], false)];
        }
        if (tableView) {actions = [...actions, new TableViewChange(tableView, false)];}
      }

      if (data.afterSuccessAction) {actions = [...actions, data.afterSuccessAction];}
      return actions;
    })
  );

  @Effect({ dispatch: false })
  auth0StoreTokens$ = merge(
    this.actions$.pipe(ofType<Auth0Login>(AUTH0_LOGIN)),
    this.actions$.pipe(ofType<Auth0RefreshTokens>(AUTH0_REFRESH_TOKENS))
  ).pipe(
    filter(action => !!action.payload),
    tap(action => {
      const tokens = action.payload;
      this.storage.setItem('tokens', JSON.stringify(tokens));
    })
  );

  @Effect()
  auth0Logout$ = this.actions$.pipe(
    ofType<Auth0Logout>(AUTH0_LOGOUT),
    map(() => {
      if (this.storage.getItem('tokens')) {
        this.storage.removeItem('tokens');
      }
      return new UserLogout();
    })
  );

  @Effect()
  requireUserLogin$ = this.actions$.pipe(
    ofType<RequireUserLogin>(REQUIRE_USER_LOGIN),
    withLatestFrom(
      this.store.pipe(selectIsUserLogged),
      (action, isLoggedIn) => [action, isLoggedIn]
    ),
    map(([action, isLoggedIn]: [RequireUserLogin, boolean]) => {
      if (isLoggedIn) {
        return action.next;
      } else {
        this.authentication.openLogin(undefined, action.next);
      }
    }),
    filter(action => !!action)
  );

  @Effect({ dispatch: false })
  openUserReg$ = this.actions$.pipe(
    ofType<OpenUserRegistration>(OPEN_USER_REGISTRATION),
    filter(action => !!action),
    tap(() => this.authentication.openRegistration())
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly authentication: AuthenticationService,
    private readonly auth0Service: Auth0Service,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly config: Config,
    storageProvider: StorageProviderService
  ) {
    this.storage = storageProvider.getLocalStorage();
  }
}
