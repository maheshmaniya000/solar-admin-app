import { PvConfig } from '@solargis/types/pv-config';

import { Actions, PV_CONFIG_CLEAR_DRAFT, PV_CONFIG_SAVE, PV_CONFIG_SET_DRAFT } from '../actions/draft.actions';

export function draftReducer(state: PvConfig, action: Actions): PvConfig {
  switch (action.type) {
    case PV_CONFIG_SET_DRAFT: {
      return action.payload;
    }
    case PV_CONFIG_CLEAR_DRAFT:
    case PV_CONFIG_SAVE: { // picked by project-detail effects and/or reducers
      return undefined;
    }
    default:
      return state;
  }
}
