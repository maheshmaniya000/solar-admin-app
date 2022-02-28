import { TranslocoService } from '@ngneat/transloco';

import { DataLayerMap, toggleUnitValuesMap } from '@solargis/dataset-core';
import { VersionedDatasetData } from '@solargis/types/dataset';
import { Project } from '@solargis/types/project';
import { latlngToUrlParam } from '@solargis/types/site';

import { months } from 'ng-shared/utils/translation.utils';

export type ProjectDataCsvOptions = {
  project: Project;
  projectName: string;
  projectData: VersionedDatasetData;
  annualLayerMap: DataLayerMap;
  monthlyLayerMap: DataLayerMap;
  translateLang: string;
};

const pvSystDataLayerKeys: { [key: string]: string } = {
  GHI: 'GHIm',
  DIF: 'Diffm',
  DNI: 'DNIm',
  TEMP: 'T24',
  ALB: 'ALBm',
  WS: 'WSm',
  RH: 'RHm',
  PWAT: 'PWATm',
  PREC: 'PRECm',
  SNOWD: 'SNOWDm',
  CDD: 'CDDm',
  HDD: 'HDDm',
};

function formatReportDate(date: Date): string {
  const twoDigits = (val: number): string => (val < 10 ? '0' : '') + val;

  const YY = date.getFullYear().toString().slice(-2);
  const MM = twoDigits(date.getMonth() + 1);
  const DD = twoDigits(date.getDate());
  const HH = twoDigits(date.getHours());
  const mm = twoDigits(date.getMinutes());
  return `${YY}${MM}${DD}-${HH}${mm}`;
}

/**
 * Create CSV with project PvSyst data
 *
 * @param options: ProjectDataCsvOptions
 * @param translocoService: TranslocoService
 */
export function getProjectPvSystDataCSV(
  options: ProjectDataCsvOptions,
  translocoService: TranslocoService
): string {
  const t = (path: string, params?: Record<string, string>): any =>
    translocoService.translate(path, params, options.translateLang) ??
    translocoService.translate(path, params, 'en');

  const siteUrl = (lat, lng): string => {
    const point = latlngToUrlParam({ lat, lng });
    return `${window.location.origin}/prospect/map?c=${point},10&s=${point}`;
  };
  const moreInfoUrl = 'https://solargis.com/products/pv-yield-assessment-study/overview/';
  const termsUrl = 'https://solargis.com/legal/general-contractual-terms/';

  const ltaAnnual = options.projectData.annual.data;
  const ltaAnnualTs = options.projectData.annual.metadata.ts;
  const ltaMonthly = options.projectData.monthly.data;

  const annualDataLayers = options.annualLayerMap.getAll(Object.keys(pvSystDataLayerKeys)).filter(l => !!l);
  const monthlyDataLayers = options.monthlyLayerMap.getAll(Object.keys(pvSystDataLayerKeys)).filter(l => !!l);

  const ltaAnnualMapped: {[key: string]: number[]} = toggleUnitValuesMap({}, ltaAnnual, annualDataLayers, { noFormat: false });
  const ltaMonthlyMapped: {[key: string]: number[]} = toggleUnitValuesMap({}, ltaMonthly, monthlyDataLayers, { noFormat: false });

  const dataRows = months.map((key, i) => {
    const monthData = Object.keys(ltaMonthlyMapped).map(id => ltaMonthlyMapped[id][i]).join(';');
    return `${t(key)};${monthData}`;
  });
  const yearDataRow = Object.keys(ltaAnnualMapped).map(id => ltaAnnualMapped[id]).join(';');

  const accessiblePvSystDataLayerKeys: string[] = Object.keys(ltaMonthlyMapped).map(k => pvSystDataLayerKeys[k]);

  const now = new Date();
  const currentYear = now.getFullYear().toString(10);
  const reportNumberDate = formatReportDate(now);

  const csv = [
    t('csvData.title'),
    '#',
    `#${t('csvData.encoding')}: utf-8`,
    `#${t('csvData.reportNumber')}: P-${options.project.company.sgCompanyId}-${reportNumberDate}`,
    `#${t('csvData.issued')}: ${now.toLocaleString()}`,
    '#',
    `#${t('csvData.siteName')}: ${options.projectName}`,
    `#${t('csvData.latitude')}: ${options.project.site.point.lat.toFixed(6)}`,
    `#${t('csvData.longitude')}: ${options.project.site.point.lng.toFixed(6)}`,
    `#${t('csvData.elevation')}: ${ltaAnnual.ELE} m a.s.l.`,
    `#${t('csvData.azimuth')}: ${ltaAnnual.AZI.toFixed(0)} deg.`,
    `#${t('csvData.inclination')}: ${ltaAnnual.SLO.toFixed(0)} deg.`,
    `#${siteUrl(options.project.site.point.lat, options.project.site.point.lng)}`,
    '#',
    `#${t('report.legal.title')}`,
    `#${t('report.legal.guarantee')}`,
    '#',
    `#${t('report.legal.uncertainty')}`,
    '#',
    `#${t('report.legal.moreInfo')} ${moreInfoUrl}`,
    '#',
    `#${t('report.legal.copyright', { currentYear })} ${t(
      'report.legal.trademark'
    )} ${t('report.legal.terms')} ${termsUrl}`,
    '#',
    `#${t('report.legal.serviceProvider')}`,
    // eslint-disable-next-line max-len
    `#Solargis s.r.o., Bottova 2A, 811 09 Bratislava, Slovakia; ${t('report.legal.registrationId')}: 45 354 766, ${t('report.legal.vatNr')}: SK2022962766; ${t('report.legal.tel')}: +421 2 4319 1708, ${t('report.legal.email')}: contact@solargis.com, ${t('report.legal.url')}: solargis.com`,
    '#',
    `#${t('csvData.columns')}`,
    ...accessiblePvSystDataLayerKeys.map(
      key =>
        `#${t(`csvData.${key}`, {
          year: new Date(ltaAnnualTs).getFullYear().toString(10)
        })}`
    ),
    '#',
    `#${t('csvData.data')}`,
    `${t('months.month')};${accessiblePvSystDataLayerKeys.join(';')}`,
    ...dataRows,
    `${t('csvData.year')};${yearDataRow}`,
  ];

  return csv.join('\n');
}
