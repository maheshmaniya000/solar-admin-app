import * as moment from 'moment';

import { removeEmpty } from '@solargis/types/utils';

import { USER_LOGOUT, UserLogout } from 'ng-shared/user/actions/auth.actions';

import { DeleteTagResult, RenameTagResult, TAG_DELETE_RESULT, TAG_RENAME_RESULT } from '../../project/actions/user-tags.actions';
import {
  Actions, PROJECT_LIST_SET_FILTER, PROJECT_LIST_ADD_FILTER, PROJECT_LIST_CLEAR_FILTER, PROJECT_LIST_SET_TAG_FILTER
} from '../actions/filter.actions';

export type TagFilterState = {[key: string]: boolean};

export type ProjectFilter = {
  favorite?: boolean;
  recent?: number; // timestamp in milliseconds - created or updated after timestamp
  archived?: boolean;
  tags?: TagFilterState;
};

export const defaultProjectFilter: ProjectFilter = { archived: false };

export function filterReducer(
  state: ProjectFilter = defaultProjectFilter,
  action: Actions | DeleteTagResult | UserLogout | RenameTagResult
): ProjectFilter {
  switch (action.type) {
    case PROJECT_LIST_SET_FILTER: {
      const payload = action.payload;
      return { ...defaultProjectFilter, ...payload };
    }
    case PROJECT_LIST_SET_TAG_FILTER: {
      const payload = action.payload;
      return { ...defaultProjectFilter, tags: payload };
    }
    case TAG_RENAME_RESULT: {
      const payload = action.payload;

      if (!state.tags) {
        return defaultProjectFilter;
      }

      const tags: Record<string, boolean> = {};
      Object.keys(state.tags).forEach(tagName => {
        const newTagName = tagName === payload.oldTagName ? payload.tagName : tagName;
        tags[newTagName] = state.tags[tagName];
      });

      return { ...defaultProjectFilter, tags };
    }
    case TAG_DELETE_RESULT: {
      const tags = { ...state.tags };
      delete tags[action.payload.tagName];
      return { ...state, tags };
    }
    case PROJECT_LIST_ADD_FILTER: {
      const mergedState = { ...state, ...action.payload };
      return removeEmpty(mergedState);
    }
    case PROJECT_LIST_CLEAR_FILTER:
    case USER_LOGOUT: {
      return defaultProjectFilter;
    }
  }
  return state;
}

export function getRecentFilter(amount = 30, unit: 'days' | 'hours' | 'minutes' = 'days'): ProjectFilter {
  const fromTimestamp = moment().subtract(amount, unit).valueOf();
  return { recent: fromTimestamp };
}
