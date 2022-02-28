import { ProjectIdOnly } from '@solargis/types/project';

import { Actions, HEADER_CLEAR_PROJECT_DETAIL_LINK, HEADER_SET_PROJET_DETAIL_LINK } from '../actions/header.actions';

export type HeaderState = {
  projectDetail?: ProjectIdOnly;
};

export function headerReducer(state: HeaderState = { projectDetail: undefined }, action: Actions): HeaderState {
  switch (action.type) {
    case HEADER_SET_PROJET_DETAIL_LINK: {
      return { ...state, projectDetail: action.payload };
    }
    case HEADER_CLEAR_PROJECT_DETAIL_LINK: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { projectDetail, ...otherState } = state;
      return otherState;
    }
    default:
      return state;
  }
}
