import { auth0Reducer, userDataReducer, userReducer } from './auth.reducers';
import { companyReducer } from './company.reducers';

export const userModuleReducer = {
  auth0: auth0Reducer,
  user: userReducer,
  userData: userDataReducer,
  company: companyReducer
};
