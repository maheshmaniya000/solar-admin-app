import { DataLayerMap } from '@solargis/dataset-core';
import { Project } from '@solargis/types/project';
import { PvModuleType } from '@solargis/types/pvlib';

export type ProjectToExport = Project & {
  layerMap: DataLayerMap;
};

export type Sg1FtpRequestRow = {
  siteId: number;
  customer: string;
  projectId: string;
  projectName: string;
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timeZone: number;
  timeStampType: string;
  terrainShading?: string;
  geometry?: string;
  azimuth?: number;
  tilt?: number;
  pvInstalledPower?: number;
  pvInstallationType?: 'BUILDING_INTEGRATED' | 'FLOATING' | 'FREE_STANDING' | 'ROOF_MOUNTED';
  pvTrackerRotLimEast?: number;
  pvTrackerRotLimWest?: number;
  pvFieldRowSpacingRelative?: number;
  pvFieldColumnSpacingRelative?: number;
  pvFieldSelfShading?: string;
  pvFieldTopologyType?: 'UNPROPORTIONAL_1' | 'PROPORTIONAL';
  pvModuleTechnology?: PvModuleType;
  pvModuleDegradationFirstYear?: number;
  pvModuleDegradation?: number;
  pvModuleTempNOCT?: number;
  pvModuleTempCoeffPmax?: number;
  pvInverterEffConstant?: number;
  pvLossesDCMismatch?: number;
  pvLossesDCCables?: number;
  pvLossesACCable?: number;
  pvLossesACTransformer?: number;
  pvLossesDCSnowMonthly?: number[];
  pvLossesDCPollutionYearly?: number;
  pvAvailabilityYearly?: number;
};
