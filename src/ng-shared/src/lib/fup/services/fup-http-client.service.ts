import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { FupService } from './fup.service';

function setCaptchaParams(params, captcha): any {
  const captchaJson = JSON.stringify(captcha);
  if (params instanceof HttpParams) {
    params.set('captcha', captchaJson);
  } else {
    params.captcha = captchaJson;
  }
  return params;
}

/**
 * Angular HttpClient wrapping class with FUP deny + recaptcha support.
 * If webservice call to SG2 API server returns error code 'fup_deny' - automatically display Recaptcha dialog.
 * When recaptcha dialog is confirmed, repeat webservice call with recaptcha token.
 *
 * Returned is observable with webservice result from API server or error code (except 'fup_deny').
 */
@Injectable()
export class FUPHttpClientService {

  constructor(private readonly http: HttpClient, private readonly fupService: FupService) {}

  get(
    url: string,
    options?: {
      headers?: HttpHeaders | {
        [header: string]: string | string[];
      };
      observe?: 'body';
      params?: HttpParams | {
        [param: string]: string | string[];
      };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    }
  ): Observable<any> {
    // create request
    return this.http.get(url, options)
      .pipe(
        catchError(error => {
          if (error.error && error.error.code === 'fup_deny') {
            // fup deny error received, display recaptcha, wait for check, repeat call
            return this.fupService.openFupCheck()
              .pipe(
                mergeMap(captcha => this.get(url, { ...options, params: setCaptchaParams(options.params, captcha) }))
              );
          } else {
            return throwError(error); // unknown error - rethrow, caller can handle error
          }
        })
      );
  }

  postJson(
    url: string,
    body: any,
    params: HttpParams | { [param: string]: string | string[] } = {},
  ): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.post(url, body, { params, headers });
  }

  post(
    url: string,
    body?: any,
    params?: HttpParams | { [param: string]: any },
  ): Observable<any> {
    return this.req(
      this.http.post.bind(this.http),
      url,
      body,
      { params }
    );
  }

  put(
    url: string,
    body?: any,
    params?: HttpParams | { [param: string]: any },
  ): Observable<any> {
    return this.req(
      this.http.put.bind(this.http),
      url,
      body,
      { params }
    );
  }

  patch(
    url: string,
    body?: any,
    params?: HttpParams | { [param: string]: any },
  ): Observable<any> {
    return this.req(
      this.http.patch.bind(this.http),
      url,
      body,
      { params }
    );
  }


  delete(
    url: string,
    body?: any,
    params?: HttpParams | { [param: string]: any },
  ): Observable<any> {
    return this.req(
      this.http.delete.bind(this.http),
      url,
      body,
      { params }
    );
  }

  req(
    method: any,
    url: string,
    body?: any,
    params?: HttpParams | { [param: string]: any },
  ): Observable<any> {
    // create request
    return method(url, body, params)
      .pipe(
        catchError(error => {
          if (error.error && error.error.code === 'fup_deny') {
            // fup deny error received, display recaptcha, wait for check, repeat call
            return this.fupService.openFupCheck()
              .pipe(
                mergeMap(captcha => this.req(method, url, body, {
                    params: setCaptchaParams(params, captcha)
                  }))
              );
          } else {
            return throwError(error); // unknown error - rethrow, caller can handle error
          }
        })
      );
  }
}
