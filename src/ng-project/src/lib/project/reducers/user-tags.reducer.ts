import { UserTag } from '@solargis/types/project';
import { OrderedMap } from '@solargis/types/utils';

import { USER_LOGOUT, UserLogout } from 'ng-shared/user/actions/auth.actions';

import {
  Actions,
  TAG_BULK_ASSIGN_RESULT,
  TAG_CREATE_RESULT,
  TAG_DELETE_RESULT,
  TAG_INIT,
  TAG_RENAME_RESULT
} from '../actions/user-tags.actions';

export type UserTagsState = OrderedMap<UserTag>;

const keyFn = (tag: UserTag): string => tag.tagName;

export function userTagsReducer(state: UserTagsState = OrderedMap.empty(keyFn), action: Actions | UserLogout): UserTagsState {
  switch (action.type) {
    case TAG_INIT: {
      const tags = action.payload;
      return new OrderedMap<UserTag>(tags, keyFn);
    }
    case TAG_CREATE_RESULT: {
      const tags: UserTag[] = state.toArray();
      tags.push(action.payload);
      tags.sort((a,b) => a.tagName.localeCompare(b.tagName, 'en', {ignorePunctuation: true}));
      return new OrderedMap<UserTag>(tags, keyFn);
    }
    case TAG_RENAME_RESULT: {
      const { oldTagName, tagName } = action.payload;
      const oldTag = state.get(oldTagName);
      const tags: UserTag[] = state.replace(oldTagName, { ...oldTag, tagName }).toArray();
      tags.sort((a,b) => a.tagName.localeCompare(b.tagName, 'en', {ignorePunctuation: true}));
      return new OrderedMap<UserTag>(tags, keyFn);
    }
    case TAG_DELETE_RESULT: {
      return state.remove(action.payload);
    }
    case TAG_BULK_ASSIGN_RESULT: {
      const changed = action.payload.reduce((acc, cur) => { acc[cur.tagName] = cur; return acc; }, {});
      const tags = state.map(tag =>
        changed[tag.tagName] ? changed[tag.tagName] : tag
      );
      return new OrderedMap<UserTag>(tags, keyFn);
    }
    case USER_LOGOUT: {
      return state.clear();
    }
  }
  return state;
}
