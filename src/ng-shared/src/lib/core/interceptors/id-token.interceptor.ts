import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { noop } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { first, mergeMap, skipWhile, tap } from 'rxjs/operators';

import { userTokensSelector } from 'ng-shared/user/selectors/auth.selectors';

import { isTokensExpired } from '../../user-shared/user-shared.utils';
import { Auth0Logout, Auth0RefreshTokens } from '../../user/actions/auth.actions';
import { ReloadCompanyList } from '../../user/actions/company.actions';
import { State } from '../../user/reducers';
import { Auth0Service } from '../../user/services/auth0.service';
import { Tokens } from '../../user/types';


/**
 * This HttpInterceptor add JWT token - IdToken (Auth0) - to each request if it is saved in application state
 * (auth.auth0.tokens).
 * Token is added into Authorization HTTP header (Authorization: Bearer ID_TOKEN)
 */
@Injectable({ providedIn: 'root' })
export class IdTokenInterceptor implements HttpInterceptor {

  constructor(
    private readonly store: Store<State>,
    private readonly transloco: TranslocoService,
    private readonly snackbar: MatSnackBar,
    private readonly auth0Service: Auth0Service,
  ) { }

  refreshingTokens = false;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add user token (and refresh it if needed)
    return this.store.select(userTokensSelector)
      .pipe(
        first(),
        mergeMap(tokens => {
          if (tokens && isTokensExpired(tokens) && tokens.sgRefreshToken) {
            // run token refresh
            this.refreshTokens(tokens);
            // wait for new tokens in DB
            return this.store.select(userTokensSelector).pipe(
              skipWhile(storeTokens => !!storeTokens && storeTokens.idToken === tokens.idToken)
            );
          } else {return of(tokens);}
        }),
        first(),
        mergeMap(tokens => {
          if (tokens) {
            return next.handle(request.clone({
              setHeaders: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Authorization: `Bearer ${tokens.idToken}`
              }
            }));
          } else {
            return next.handle(request);
          }
        }),
        tap(() => noop, this.authExpiredCallback.bind(this))
      );
  }

  /**
   * We need to ensure refreshing tokens is not run multiple times
   * when multiple requests are dispatched
   */
  refreshTokens(tokens: Tokens): void {
    if (!this.refreshingTokens) {
      this.refreshingTokens = true;

      this.auth0Service.refreshLogin(tokens).pipe(first()).subscribe(
        loginResult => {
          this.store.dispatch(new Auth0RefreshTokens(loginResult.tokens));
          this.store.dispatch(new ReloadCompanyList());
          this.refreshingTokens = false;
        },
        () => {
          this.store.dispatch(new Auth0Logout());
          this.refreshingTokens = false;
        }
      );
    }
  }

  /**
   * Handle expired tokens
   */
  authExpiredCallback(err: any): void {
    if (err instanceof HttpErrorResponse) {
      if ((err.status === 401 || err.status === 403) && err.error
        && (err.error.code === 'authorisation.bad.jwt' || err.error.code === 'invalid_token')
      ) {
        if (err.status === 401) {
          this.store.dispatch(new Auth0Logout());
        }

        this.transloco.selectTranslate(['auth.expired', 'auth.forbidden', 'common.action.reload'], { url: decodeURI(err.url) })
          .pipe(first())
          .subscribe(
          ([strExpired, strForbidden, strReload]) => this.snackbar.open(
              err.status === 403 ? strForbidden : strExpired,
              strReload,
              { duration: 15000 }
            ).onAction().subscribe(() => {
              location.reload();
            })
          );
      }
    }
  }
}
