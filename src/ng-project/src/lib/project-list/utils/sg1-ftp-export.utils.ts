import { PvConfigType } from '@solargis/types/pv-config';
import { InverterParams, PvModuleType } from '@solargis/types/pvlib';

export const pvModuleTempCoeffPmax: { [key in PvModuleType]: number } = {
  [PvModuleType.CSI]: -0.432,
  [PvModuleType.ASI]: -0.300,
  [PvModuleType.CDTE]: -0.311,
  [PvModuleType.CIS]: -0.306,
};

export function pvInstallationTypeMapping(configType: PvConfigType): 'BUILDING_INTEGRATED' | 'FLOATING' | 'FREE_STANDING' | 'ROOF_MOUNTED' {
  switch (configType) {
    case PvConfigType.RooftopSmall:
    case PvConfigType.RooftopLargeTilted:
      return 'ROOF_MOUNTED';
    case PvConfigType.RooftopLargeFlat:
    case PvConfigType.GroundFixed:
    case PvConfigType.TrackerOneAxisHorizontalNS:
      return 'FREE_STANDING';
    case PvConfigType.BuildingIntegrated:
      return 'BUILDING_INTEGRATED';
    case PvConfigType.HydroMountedLargeScale:
      return 'FLOATING';
    default:
      return null;
  }
}

export function pvFieldTopologyTypeMapping(configType: PvConfigType, moduleType: PvModuleType): 'UNPROPORTIONAL_1' | 'PROPORTIONAL' {
  if (configType === PvConfigType.RooftopLargeFlat || configType === PvConfigType.GroundFixed ||
    configType === PvConfigType.TrackerOneAxisHorizontalNS || configType === PvConfigType.HydroMountedLargeScale) {
    return moduleType === PvModuleType.CSI ? 'UNPROPORTIONAL_1' : 'PROPORTIONAL';
  }
  return null;
}

export function computeEuroEfficiency(inverterParams: InverterParams): number {
  const pdcRanges = [5, 10, 20, 30, 50, 100];
  const coefs = [0.03, 0.06, 0.13, 0.1, 0.48, 0.2];

  const euroEffs = pdcRanges.map((pdcRange, i) => {
    const pdcInput = pdcRange / 100 * inverterParams.Paco;
    const vdco = inverterParams.Vdco;
    const a = inverterParams.Pdco * (1 + inverterParams.C1 * (inverterParams.Vdco - vdco));
    const b = inverterParams.Pso * (1 + inverterParams.C2 * (inverterParams.Vdco - vdco));
    const c = inverterParams.C0 * (1 + inverterParams.C3 * (inverterParams.Vdco - vdco));
    const acPower = Math.min(
      (inverterParams.Paco / (a - b) - c * (a - b)) * (pdcInput - b) + c * Math.pow(pdcInput - b, 2)
      , inverterParams.Paco
    );
    const eff = 100 * acPower / pdcInput;
    return eff * coefs[i];
  });

  return euroEffs.reduce((sum, eff) => sum + eff, 0);
}
