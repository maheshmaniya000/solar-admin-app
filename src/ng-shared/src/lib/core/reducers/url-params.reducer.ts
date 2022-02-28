import { Params } from '@angular/router';

import { removeEmpty } from '@solargis/types/utils';

import { URL_PARAMS_INIT, URL_PARAMS_SYNC, URL_PARAMS_POP_STATE, Actions } from '../actions/url-params.actions';

export function urlParamsReducer(state: Params, action: Actions): Params {
  switch (action.type) {
    case URL_PARAMS_INIT:
    case URL_PARAMS_POP_STATE: {
      return action.payload;
    }
    case URL_PARAMS_SYNC: {
      const mergedParams = { ...state, ...action.payload };
      return removeEmpty(mergedParams);
    }
    default: {
      return state;
    }
  }
}
