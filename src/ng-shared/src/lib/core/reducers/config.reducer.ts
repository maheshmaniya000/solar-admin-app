import { Action, createReducer, on } from '@ngrx/store';

import { Config } from '../../config';
import { configInit } from '../actions/config.actions';

export type ConfigState = Pick<Config, 'env'>;

const initialState: ConfigState = {
  env: undefined
};

export const reducer = createReducer<ConfigState>(
  initialState,
  on(configInit, (state, { config: { env } }) => ({ ...state, env }))
);

export function reducers(state: ConfigState | undefined, action: Action): ConfigState {
  return reducer(state, action);
}
