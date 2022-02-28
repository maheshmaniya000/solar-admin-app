import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { State } from '../reducers';
import { waitUntilUserLogged, userTokensSelector } from '../selectors/auth.selectors';
import { AuthenticationService } from '../services/authentication.service';

/**
 * Only logged in users can activate route
 */
@Injectable()
export class LoginUserGuard implements CanActivate {

  dialogRef: MatDialogRef<any>;

  constructor(private readonly store: Store<State>, private readonly authentication: AuthenticationService) {}

  canActivate(): Observable<boolean> {

    return this.store.select(userTokensSelector).pipe(
      // When user token is loaded from localStorage and is expired
      // refreshing it may take some time. If it was sucessful, we need to close the dialog
      tap(() => {
        if (this.dialogRef) {this.dialogRef.close();}
      }),
      switchMap(tokens => {
        if (!!tokens && tokens.idToken) {return this.store.pipe(waitUntilUserLogged);}
        else {
          // Open login form and try again
          this.dialogRef = this.authentication.openLogin();

          return this.dialogRef.afterClosed().pipe(
            switchMap(() => this.store.pipe(waitUntilUserLogged)),
          );
        }
      }),
    );
  }
}
