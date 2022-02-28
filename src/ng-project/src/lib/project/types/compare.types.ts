import { EnergySystem, EnergySystemRef } from '@solargis/types/project';

import { ExtendedProject } from '../reducers/projects.reducer';

/**
 * Object representing project with energy energy system in compare
 * Both EnergySystem and EnergySystemRef are included
 */
export type CompareItem = {
  project: ExtendedProject;
  energySystem: EnergySystem;
  energySystemRef: EnergySystemRef;
  energySystemId: string;
  highlighted: boolean;
  colorIndex: number;
};
