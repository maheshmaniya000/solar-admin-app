import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, filter } from 'rxjs/operators';

import { USER_LOGOUT, USER_LOGIN } from '../../user/actions/auth.actions';
import { SELECT_COMPANY, UNSELECT_COMPANY } from '../../user/actions/company.actions';
import { ClearCartAction } from '../actions/cart.actions';

@Injectable()
export class CartEffects {

  @Effect()
  clearCart$ = this.actions$.pipe(
    ofType(SELECT_COMPANY, UNSELECT_COMPANY, USER_LOGIN, USER_LOGOUT),
    filter((action: any) => !(action.opts && action.opts.skipCartClear)),
    map(() => new ClearCartAction())
  );

  constructor(
    private readonly actions$: Actions,
  ) {}

}
