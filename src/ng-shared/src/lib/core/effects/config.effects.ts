import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { first, map } from 'rxjs/operators';

import { Config } from '../../config';
import { AFTER_BOOTSTRAP } from '../actions/bootstrap.action';
import { configInit } from '../actions/config.actions';

@Injectable()
export class ConfigEffects {
  @Effect()
  initAfterBootstrap$ = this.actions$.pipe(
    ofType(AFTER_BOOTSTRAP),
    first(),
    map(() => configInit({ config: this.config }))
  );

  constructor(private readonly actions$: Actions, private readonly config: Config) {}
}
