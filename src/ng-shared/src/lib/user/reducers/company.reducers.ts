import { CompanyWithToken } from '@solargis/types/user-company';
import { OrderedMap } from '@solargis/types/utils';

import { UserLogout, USER_LOGOUT } from '../actions/auth.actions';
import {
  CompanyActions,
  SELECT_COMPANY,
  STORE_COMPANY_LIST,
  UNSELECT_COMPANY,
  UPDATE_COMPANY
} from '../actions/company.actions';
import { CompanyState } from '../types';

const keyFn = (cwt: CompanyWithToken): string => cwt.company.sgCompanyId;

const initState: CompanyState = {
  selected: null,
  listLoaded: false,
  list: new OrderedMap<CompanyWithToken>([], keyFn),
};

/**
 * Reducer for all companies actions
 *
 * @param state
 * @param action
 * @returns
 */
export function companyReducer(state: CompanyState = initState, action: CompanyActions | UserLogout): CompanyState {
  switch (action.type) {
    case STORE_COMPANY_LIST: {
      const selected = action.selectCompanyId ? action.selectCompanyId : state.selected;
      return { ...state, list: new OrderedMap<CompanyWithToken>(action.payload, keyFn), selected, listLoaded: true };
    }
    case UNSELECT_COMPANY: {
      return { ...state, selected: null };
    }
    case SELECT_COMPANY: {
      return { ...state, selected: action.payload };
    }
    case UPDATE_COMPANY: {
      return { ...state, list: state.list.set(action.payload) };
    }
    case USER_LOGOUT: {
      return initState;
    }
  }

  return state;
}
