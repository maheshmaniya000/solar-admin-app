import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map, tap, switchMap, withLatestFrom, mergeMap } from 'rxjs/operators';

import { User } from '@solargis/types/user-company';

import { StorageProviderService } from 'ng-shared/core/services/storage-provider.service';

import { AmplitudeTrackEvent } from '../../core/actions/amplitude.actions';
import { OPEN_REQUEST_TRIAL_DIALOG } from '../../core/actions/dialog.actions';
import { URL_PARAMS_INIT, UrlParamsAction } from '../../core/actions/url-params.actions';
import { RequestTrialDialogComponent } from '../../user-shared/components/request-trial-dialog/request-trial-dialog.component';
import {
  AUTH0_EMAIL_VERIFY, AUTH0_FORGOT_PASSWORD_CHANGE, Auth0EmailVerify, Auth0ForgotPasswordChange,
  USER_LOGIN, UserData, UserLogin, USER_RELOAD_DATA, OpenUserRegistration,
  UPDATE_USER_SETTINGS, UpdateUserSettings
} from '../actions/auth.actions';
import { SelectCompany } from '../actions/company.actions';
import { sg1TermsConfirmedStorageKey } from '../components/confirm-terms/confirm-terms.dialog';
import { State } from '../reducers';
import { selectUser, selectUserData } from '../selectors/auth.selectors';
import { Auth0Service } from '../services/auth0.service';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { UserState } from '../types';


@Injectable()
export class UserEffects {

  /**
   * Verification of user email (registration) -> open dialog & redirect to homepage
   *
   * @type {Observable<any>}
   */
  @Effect({ dispatch: false })
  emailVerify$ = this.actions$.pipe(
    ofType<Auth0EmailVerify>(AUTH0_EMAIL_VERIFY),
    tap(() => {
      this.authenticationService.openEmailVerification();
    }),
    tap(() => {
      this.router.navigateByUrl('');
    })
  );

  /**
   * User is log in -> get all data from backend
   *
   * @type {Observable<any>}
   */
  @Effect()
  userReloadUserData$: Observable<any> = this.actions$.pipe(
    ofType(USER_RELOAD_DATA),
    withLatestFrom(this.store.pipe(selectUser), (action, user) => user),
    switchMap((state: UserState) => this.userService.getUserInfo(state.sgAccountId)),
    switchMap((user: User) => {
      const actions: any[] = [ new UserData(user) ];
      if (user.selectedSgCompanyId) {
        actions.push(new SelectCompany(user.selectedSgCompanyId, { skipSaveOnBackend: true }));
      }
      return actions;
    })
  );

  /**
   * Update user settings - e.g. language, unit toggle
   */
  @Effect({ dispatch: false })
  updateUserSettings$ = this.actions$.pipe(
    ofType<UpdateUserSettings>(UPDATE_USER_SETTINGS),
    withLatestFrom(this.store.pipe(selectUserData), (action, user) => user),
    filter((user: User) => !!(user && user.sgAccountId)),
    switchMap((user: User) => this.userService.updateUser(user.sgAccountId, { settings: user.settings }))
  );

  /**
   * When flag 'sg1LoginSG2TermsConfirmed' is set to TRUE, user needs to confirm SG2 Terms
   *
   * @type {Observable<any>}
   */
  @Effect({ dispatch: false })
  userLoginSG2TermsCheck$ = this.actions$.pipe(
    ofType<UserLogin>(USER_LOGIN),
    tap(data => {
      if (!data.payload.sg1LoginSG2TermsConfirmed) {
        // TODO: move sg1termsConfirmed from auth0 to mongodb
        const storage = this.storageProvider.getSessionStorage();
        if (storage.getItem(sg1TermsConfirmedStorageKey) !== data.payload.sgAccountId) {
          this.authenticationService.openConfirmTerms();
        }
      }
    })
  );

  /**
   * When user open url - callback page with token - to change password.
   * Open change password dialog and redirect to homepage.
   *
   * @type {Observable<any>}
   */
  @Effect({ dispatch: false })
  auth0PasswordChangeForgot = this.actions$.pipe(
    ofType<Auth0ForgotPasswordChange>(AUTH0_FORGOT_PASSWORD_CHANGE),
    tap(() => {
      this.authenticationService.openChangePasswordToken();
    }),
    tap(() => {
      this.router.navigateByUrl('');
    })
  );

  /**
   * When user finish registration - click on link in email
   *
   * @type {Observable<any>}
   */
  @Effect()
  registrationCallbackPage = this.actions$.pipe(
    ofType<UrlParamsAction>(URL_PARAMS_INIT),
    first(),
    filter(action => action.payload.registration_token),
    switchMap(action => this.auth0Service.registrationVerify(action.payload.registration_token)),
    mergeMap((status: boolean) => {
      const actions: any[] = [ new Auth0EmailVerify(status) ];
      if (status) {actions.push(new AmplitudeTrackEvent('sign_up_completed'));}
      return actions;
    })
  );

  /**
   * When user confirm link to create new account in email ->
   * -> this effect check url params and dispatch proper action to activate account and show message about account actiovation
   */
  @Effect()
  forgotPasswordCallbackPage$ = this.actions$.pipe(
    ofType<UrlParamsAction>(URL_PARAMS_INIT),
    first(),
    filter(action => action && action.payload['forgot-password-token']),
    map(action => action.payload['forgot-password-token']),
    map(token => new Auth0ForgotPasswordChange(token))
  );

  /**
   * Open registration link
   * Used as redirect from PHP solargis page
   */
  @Effect()
  openRegistration$ = this.actions$.pipe(
    ofType<UrlParamsAction>(URL_PARAMS_INIT),
    first(),
    filter(action => action && action.payload['show-registration']),
    map(() => new OpenUserRegistration())
  );

  @Effect({dispatch: false})
  openRequestTrialDialog$ = this.actions$.pipe(
    ofType(OPEN_REQUEST_TRIAL_DIALOG),
    map(() => {
      this.dialog.open(RequestTrialDialogComponent, { data: { app: 'prospect' } });
    })
  );

  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly http: HttpClient,
    private readonly auth0Service: Auth0Service,
    private readonly userService: UserService,
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    private readonly storageProvider: StorageProviderService,
  ) { }
}
