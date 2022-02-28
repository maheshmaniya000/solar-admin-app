import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LambdaCaptchaResponse } from '@solargis/types/captcha';

import { Config } from 'ng-shared/config';

/**
 * Service providing Custom Captcha API
 */
@Injectable()
export class LambdaCaptchaService {
  apiUrl: string;

  constructor(private readonly http: HttpClient, private readonly config: Config) {
    this.apiUrl = `${config.api.customerUrl}/auth`;
  }

  create(): Observable<LambdaCaptchaResponse> {
    return this.http.get<LambdaCaptchaResponse>(`${this.apiUrl}/captcha`).pipe(
      catchError(err => throwError(err))
    );
  }

}
