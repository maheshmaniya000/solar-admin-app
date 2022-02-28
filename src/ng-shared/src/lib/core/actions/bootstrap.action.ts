import { Action } from '@ngrx/store';

export const AFTER_BOOTSTRAP = '[bootstrap] after';

export class AfterBootstrap implements Action {
  readonly type = AFTER_BOOTSTRAP;
}
