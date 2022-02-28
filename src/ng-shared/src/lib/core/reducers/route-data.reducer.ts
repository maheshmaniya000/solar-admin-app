import { Data } from '@angular/router';

import { Actions, ROUTE_DATA_CHANGED } from '../actions/route-data.actions';

// TODO merge with routerReducer

export function routeDataReducer(state, action: Actions): Data {
  switch (action.type) {
    case ROUTE_DATA_CHANGED:
      return action.payload;
    default: {
      return state;
    }
  }
}
