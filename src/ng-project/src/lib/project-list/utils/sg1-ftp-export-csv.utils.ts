import { translate } from '@ngneat/transloco';

import { toggleUnitValuesMap } from '@solargis/dataset-core';
import { combineDataArray, VersionedDatasetDataMap } from '@solargis/types/dataset';
import { getProjectDatasetDataMap, getProjectDefaultSystem, hasPvConfig } from '@solargis/types/project';
import { SystemPvConfig } from '@solargis/types/pv-config';
import { InverterModel, Mounting } from '@solargis/types/pvlib';
import { LATLNG_DECIMAL_PLACES } from '@solargis/types/site';
import { round } from '@solargis/types/utils';
import { resolveUnitValue, units } from '@solargis/units';

import { ProjectToExport, Sg1FtpRequestRow } from '../types/sg1-ftp-export.types';
import {
  computeEuroEfficiency,
  pvFieldTopologyTypeMapping,
  pvInstallationTypeMapping,
  pvModuleTempCoeffPmax
} from './sg1-ftp-export.utils';

const columns = [
  'siteId', 'customer', 'projectId', 'projectName', 'countryName', 'countryCode', 'latitude', 'longitude', 'elevation',
  'timeZone', 'timeStampType', 'terrainShading', 'geometry', 'azimuth', 'tilt', 'pvInstalledPower',  'pvInstallationType',
  'pvTrackerRotLimEast', 'pvTrackerRotLimWest', 'pvFieldRowSpacingRelative', 'pvFieldColumnSpacingRelative',
  'pvFieldSelfShading', 'pvFieldTopologyType', 'pvModuleTechnology', 'pvModuleDegradationFirstYear', 'pvModuleDegradation',
  'pvModuleTempNOCT', 'pvModuleTempCoeffPmax', 'pvInverterEffConstant',
  'pvLossesDCMismatch', 'pvLossesDCCables', 'pvLossesACCable', 'pvLossesACTransformer',
  'pvLossesDCSnowMonthly', 'pvLossesDCPollutionYearly', 'pvAvailabilityYearly',
];

const dataColumns = ['ELE'];

/**
 * Create CSV with selected/all projects data
 *
 * @param projects: ProjectToExport[]
 * @param exported: current datetime
 */
export function sg1FtpExportProjectsToCSV(projects: ProjectToExport[], exported: string): string {
  // eslint-disable-next-line complexity
  const csvProjects: Sg1FtpRequestRow[] = projects.map((p, i) => {
    const { lta, pvcalcDetails } = getProjectDatasetDataMap(p, 'prospect') as VersionedDatasetDataMap;
    const projectData = combineDataArray(lta, pvcalcDetails);
    const dataLayers = p.layerMap.getAll(dataColumns).filter(l => !!l);
    const dataMapped: {[key: string]: number} = toggleUnitValuesMap({}, projectData.annual.data, dataLayers, { noFormat: false });
    const placemark = p.site && p.site.place && p.site.place.placemark;

    const energySystem = getProjectDefaultSystem(p, 'prospect');
    let energySystemProps = {};
    if (hasPvConfig(energySystem)) {
      const pvConfig: SystemPvConfig = energySystem.pvConfig as SystemPvConfig;
      const pvRequest = energySystem.pvRequest;
      energySystemProps = {
        terrainShading: pvRequest.TerrainShading.toString().toUpperCase(),
        geometry: pvRequest.geometry,
        azimuth: pvRequest.azimuth,
        tilt: (pvRequest.geometry === Mounting.OneAxisVertical || pvRequest.geometry === Mounting.FixedOneAngle) ? pvRequest.tilt : '',
        pvInstalledPower: resolveUnitValue(units['kWh/kWp'].annual, pvRequest.pvInstalledPower),
        pvInstallationType: pvInstallationTypeMapping(pvConfig.type),
        pvTrackerRotLimEast: pvRequest.geometry !== Mounting.FixedOneAngle ? pvRequest.rotationLimitEast : '',
        pvTrackerRotLimWest: pvRequest.geometry !== Mounting.FixedOneAngle ? pvRequest.rotationLimitWest : '',
        pvFieldRowSpacingRelative: (pvRequest.geometry === Mounting.FixedOneAngle
          || pvRequest.geometry === Mounting.OneAxisVertical
          || pvRequest.geometry === Mounting.TwoAxisAstronomical)
          ? pvRequest.pvFieldRowSpacingRelative
          : '',
        pvFieldColumnSpacingRelative: (pvRequest.geometry === Mounting.OneAxisHorizontalNS
          || pvRequest.geometry === Mounting.OneAxisInclinedNS
          || pvRequest.geometry === Mounting.OneAxisVertical
          || pvRequest.geometry === Mounting.TwoAxisAstronomical)
          ? pvRequest.pvFieldColumnSpacingRelative
          : '',
        pvFieldSelfShading: pvRequest.pvFieldSelfShading.toString().toUpperCase(),
        pvFieldTopologyType: pvFieldTopologyTypeMapping(pvConfig.type, pvRequest.pvModuleTechnology),
        pvModuleTechnology: pvRequest.pvModuleTechnology,
        pvModuleDegradationFirstYear: pvRequest.pvModuleDegradationFirstYear,
        pvModuleDegradation: pvRequest.pvModuleDegradation,
        pvModuleTempNOCT: pvRequest.pvModuleTempNOCT,
        pvModuleTempCoeffPmax: pvModuleTempCoeffPmax[pvRequest.pvModuleTechnology],
        pvInverterEffConstant: pvRequest.pvInverterType === InverterModel.Surface
          ? round(computeEuroEfficiency(pvRequest.inverterParams), 1)
          : '',
        pvLossesDCMismatch: pvRequest.pvLossesDCMismatch,
        pvLossesDCCables: pvRequest.pvLossesDCCables,
        pvLossesACCable: pvRequest.pvLossesACCable,
        pvLossesACTransformer: pvRequest.pvLossesACTransformer,
        pvLossesDCSnowMonthly: pvRequest.pvLossesDCSnowMonthly,
        pvLossesDCPollutionYearly: pvRequest.pvLossesDCPollutionYearly,
        pvAvailabilityYearly: pvRequest.pvAvailabilityYearly,
      };
    }

    return {
      siteId: i + 1,
      customer: `"${p.company.name || ''}"`,
      projectId: p._id,
      projectName: `"${p.name}"`,
      countryName: placemark && placemark.countryName ? placemark.countryName.toUpperCase() : '',
      countryCode: placemark && placemark.countryCode ? placemark.countryCode.toUpperCase() : '',
      latitude: round(p.site.point.lat, LATLNG_DECIMAL_PLACES),
      longitude: round(p.site.point.lng, LATLNG_DECIMAL_PLACES),
      elevation: dataMapped.ELE,
      timeZone: p.site && p.site.timezone && p.site.timezone.gmtOffset ? round(p.site.timezone.gmtOffset / 3600, 1) : 0,
      timeStampType: 'CENTER',
      ...energySystemProps,
    };
  });

  // \uFEFF at the beginning of file fixes UTF encoding issue in Excel
  // see https://stackoverflow.com/questions/6002256/is-it-possible-to-force-excel-recognize-utf-8-csv-files-automatically
  const csv = [
    `\uFEFF#${translate('export.csvInfo.exported')}: ${exported}`,
    `#${translate('export.csvInfo.ftpCompatible')}: https://wiki.solargis.com/display/public/Solargis+API+User+Guide`,
    '#',
    columns.join(';'),
    ...csvProjects.map(project => columns.map(col => project[col]).join(';')),
  ];

  return csv.join('\n');
}
