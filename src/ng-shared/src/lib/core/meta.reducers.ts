import { ActionReducer } from '@ngrx/store'; // AOT build fails without Action and ActionReducer imported

import { State } from 'ng-shared/core/reducers';

// console.log all actions
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return function(state, action) {
    console.log(action.type, action/*, action, state*/);
    return reducer(state, action);
  };
}
