import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CaptchaResult } from '@solargis/types/captcha';
import { RegistrationRequest } from '@solargis/types/user-company';

import { Config } from '../../config';
import { LoginResult, NewUser, RegistrationResult, Tokens } from '../types';


/**
 * Service handling Auth0 API:
 * - registration, login, change password
 */
@Injectable({ providedIn: 'root' })
export class Auth0Service {

  authApiUrl: string;
  httpWithoutInterceptor: HttpClient;

  constructor(
    private readonly config: Config,
    private readonly http: HttpClient,
    private readonly httpBackend: HttpBackend,
    public dialog: MatDialog
  ) {
    this.authApiUrl = `${config.api.customerUrl}/auth`;
    this.httpWithoutInterceptor = new HttpClient(httpBackend);
  }

  /**
   * Login user by username and password (Auth0).
   */
  loginUser(email: string, password: string, rememberMe: boolean): Observable<LoginResult> {
    const request = { email, password, rememberMe };
    return this.http.post(`${this.config.api.customerUrl}/auth/login`, request) as Observable<LoginResult>;
  }

  refreshLogin(tokens: Tokens): Observable<LoginResult> {
    return this.httpWithoutInterceptor.post(this.getRefreshLoginApiUrl(), {
      sgRefreshToken: tokens.sgRefreshToken
    }) as Observable<LoginResult>;
  }

  /** Required for id-token.interceptor */
  getRefreshLoginApiUrl(): string {
    return `${this.config.api.customerUrl}/auth/refresh-login`;
  }

  /**
   * Register new user (Auth0, implementation of web service is in SG2 API).
   * Result contains status and message.
   */
  registerNewUser(
    newUser: NewUser,
    captcha: CaptchaResult,
    lang: string,
    createCompany: any = null,
    companyInvitationTokenId: string = null
  ): Observable<RegistrationResult> {
    const request: RegistrationRequest = {
      email: newUser.email,
      password: newUser.password,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      companyInvitationTokenId,
      captcha
    };
    if (createCompany) {request.createCompany = createCompany;} // add createCompany later if exists

    const result: RegistrationResult = {
      status: false,
      messageCode: ''
    };

    return this.http.post(`${this.authApiUrl}/register`, request)
      .pipe(
        map(() => {
          // ok - user has been registered
          result.status = true;
          result.messageCode = 'auth.auth0.registrationOk';
          return result;
        }),
        catchError(err => {
          const error = err.error?.error;
          if (error === 'captcha_not_valid') {
            result.messageCode = 'auth.auth0.recaptchaNotValid';
            return of(result);
          } else if (error === 'user.already_exists') {
            result.messageCode = 'auth.auth0.emailAlreadyRegistred';
            return of(result);
          } else if (error === 'otp_code.invalid_otp') {
            result.messageCode = 'user.company.freeTrial.incorrectVerificationCode';
            return of(result);
          } else {
            result.messageCode = 'auth.auth0.unknownError';
            return of(result);
          }
        })
      );
  }

  /**
   * Change password for user (must be logged)
   * (Auth0, implementation of web service is in SG2 API).
   * Result contains status and message.
   */
  changePassword(oldPassword: string, newPassword: string): Observable<RegistrationResult> {
    return this.http.post(`${this.authApiUrl}/change-password`, {
      oldPassword, newPassword
    }).pipe(
      map(() => ({ status: true, messageCode: 'changePasswordOk' })),
      catchError(() => of({ status: false, messageCode: 'error' })),
    );
  }

  /**
   * Open dialog to request token to change password.
   * Token is send to client email with callback url to change password.
   */
  forgotPassword(email: string, captcha: CaptchaResult): Observable<RegistrationResult> {
    const result: RegistrationResult = {
      status: false,
      messageCode: ''
    };

    return this.http.post(`${this.authApiUrl}/forgot-password`, { email, captcha })
      .pipe(
        map(() => {
          // ok - use password has been changed
          result.status = true;
          result.messageCode = 'ok';
          return result;
        }),
        catchError(err => {
          // ok - error with forgot password
          const error = err.error;

          if (error.code === 'captcha_not_valid' || error.code === 'captcha_required') {
            // error with captcha validation
            result.messageCode = 'recaptchaNotValid';
            return of(result);
          } else {
            // unknown error
            result.messageCode = 'error';
            return of(result);
          }
        })
      );
  }

  /**
   * Change password - required is valid token and new password to set.
   */
  forgotPasswordChange(tokenId: string, password: string): Observable<RegistrationResult> {
    const result: RegistrationResult = {
      status: false,
      messageCode: ''
    };

    return this.http.post(`${this.authApiUrl}/forgot-password-change`, { tokenId, password })
      .pipe(
        map(() => {
          // ok - use password has been changed
          result.status = true;
          result.messageCode = 'changeOk';
          return result;
        }),
        catchError(err => {
          // ok - error with forgot password
          const error = err.error;

          if (error.code === 'auth.token_not_valid') {
            // token is not valid - not existing token or token has been already used
            result.messageCode = 'tokenNotValid';
            return of(result);
          } else {
            // unknown error
            result.messageCode = 'error';
            return of(result);
          }
        })
      );
  }

  /**
   * Confirm SG2 Terms -> change flag in Auth0.
   */
  confirmTerms(): Observable<boolean> {
    return this.http.post(`${this.authApiUrl}/confirm-sg2-terms`, {})
      .pipe(
        map(() => true),
      );
  }

  registrationVerify(tokenId: string): Observable<boolean> {
    return this.http.post(`${this.authApiUrl}/registration-verify`, { tokenId })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  sendNewVerificationEmail(email: string, captcha: CaptchaResult): Observable<boolean> {
    return this.http.post(`${this.config.api.customerUrl}/auth/resend-verification-email`, { email, captcha }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
