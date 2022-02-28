import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { asyncScheduler, Observable, zip } from 'rxjs';
import { filter, first, mergeMap, throttleTime } from 'rxjs/operators';

import { ReloadCompanyList } from '../../user/actions/company.actions';
import { State } from '../../user/reducers';
import { selectActiveCompanyToken, selectActiveCompanyTokenExpiration } from '../../user/selectors/company.selectors';


const header = 'x-solargis-company';


/**
 * This HttpInterceptor add Company token - to each request if it is saved in application state
 * (user.company.selected.token).
 * Token is added into x-solargis-company HTTP header (x-solargis-company: TOKEN)
 */
@Injectable({ providedIn: 'root' })
export class CompanyTokenInterceptor implements HttpInterceptor {

  refreshTokens$ = new EventEmitter<void>();

  constructor(private readonly store: Store<State>) {
    this.refreshTokens$.pipe(
      throttleTime(8000, asyncScheduler, { leading: true, trailing: false }),
    ).subscribe(() => this.store.dispatch(new ReloadCompanyList()));
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return zip(
      this.store.pipe(selectActiveCompanyToken),
      this.store.pipe(selectActiveCompanyTokenExpiration)
    ).pipe(
      filter(([, exp]) => {
        if (exp && exp < Date.now()) {
          this.refreshTokens$.next();
        }
        return !exp || (exp > Date.now());
      }),
      first(),
      mergeMap(([token, ]) => {
        if (token) {
          return next.handle(request.clone({
            setHeaders: {
              [header]: token
            }
          }));
        } else {
          return next.handle(request);
        }
      })
    );
  }
}
