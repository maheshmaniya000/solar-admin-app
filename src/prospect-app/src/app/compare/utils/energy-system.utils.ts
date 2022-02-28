import { EnergySystem } from '@solargis/types/project';

export function hasEconomyConfig(system: EnergySystem): boolean {
  return system && !!system.economy;
}
