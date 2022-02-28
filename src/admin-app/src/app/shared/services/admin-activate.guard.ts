import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { selectIsUserAdmin } from 'ng-shared/user/selectors/permissions.selectors';

import { fromAdmin } from '../../store';

@Injectable({
  providedIn: 'root'
})
export class AdminActivateGuard implements CanActivate, CanActivateChild {

  private readonly origin: string;

  constructor(private readonly store: Store<fromAdmin.State>, @Inject(DOCUMENT) private readonly document: Document) {
    const { protocol, host } = document.location;
    this.origin = `${protocol}//${host}`;
  }

  canActivate(): Observable<boolean> {
    return this.isUserAdminWithRedirect();
  }

  canActivateChild(): Observable<boolean> {
    return this.isUserAdminWithRedirect();
  }

  private isUserAdminWithRedirect(): Observable<boolean> {
    return this.store.pipe(
      selectIsUserAdmin,
      tap(isAdmin => {
        if (!isAdmin) {
          document.location.href = this.origin;
        }
      })
    );
  }
}
