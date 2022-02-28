import { PvConfig } from '@solargis/types/pv-config';

import { State as ProjectDetailState } from '../../project-detail/reducers';
import { draftReducer } from './draft.reducer';

export type PvConfigState = {
  // systemRef: EnergySystemRef,
  draft: PvConfig;
};

export const reducers = {
  draft: draftReducer
};

export interface State extends ProjectDetailState {
  pvConfig: PvConfigState;
}
