import { createAction, props } from '@ngrx/store';

import { ConfigState } from '../reducers/config.reducer';

export const configInit = createAction('[config] Init', props<{ config: ConfigState }>());
