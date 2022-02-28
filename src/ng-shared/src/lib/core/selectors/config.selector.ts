import { createFeatureSelector } from '@ngrx/store';

import { State } from '../reducers';
import { ConfigState } from '../reducers/config.reducer';

export const selectConfigState = createFeatureSelector<State, ConfigState>('config');
