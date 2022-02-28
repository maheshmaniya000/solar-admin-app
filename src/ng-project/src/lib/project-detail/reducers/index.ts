import { EnergySystemRef } from '@solargis/types/project';

import { State as ProjectState } from '../../project/reducers';
import { selectedEnergySystemReducer } from './selected-energy-system.reducer';

export type ProjectDetailState = {
  selectedEnergySystem: EnergySystemRef;
};

export interface State extends ProjectState {
  projectDetail: ProjectDetailState;
}

export const reducers = {
  selectedEnergySystem: selectedEnergySystemReducer
};
