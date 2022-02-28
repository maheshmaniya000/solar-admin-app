import { EnergySystemRef } from '@solargis/types/project';

import { Actions, PROJECT_DETAIL_CLEAR_SYSTEM, PROJECT_DETAIL_SELECT_SYSTEM } from '../actions/selected-system.actions';

export function selectedEnergySystemReducer(state: EnergySystemRef, action: Actions): EnergySystemRef {
  switch (action.type) {
    case PROJECT_DETAIL_SELECT_SYSTEM: {
      return action.payload;
    }
    case PROJECT_DETAIL_CLEAR_SYSTEM: {
      return undefined;
    }
    default:
      return state;
  }
}
