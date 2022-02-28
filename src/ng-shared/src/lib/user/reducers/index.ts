import { State as CoreState } from '../../core/reducers';
import { UserModuleState } from '../types';

export interface State extends CoreState {
  user: UserModuleState;
}
