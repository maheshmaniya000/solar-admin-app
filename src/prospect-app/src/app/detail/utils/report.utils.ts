import { Report } from '@solargis/types/project';

import { MimeType } from 'ng-shared/shared/utils/download.utils';

export function getReportFileName(projectName: string, report: Report): string {
  const name = projectName.substr(0, 20).replace(' ', '_');
  const e = report.economy ? '_f' : '';
  return `Solargis_Prospect_${name}_${report.lang}${e}.${report.type}`;
}

export const mimeTypeByReportType = {
  csv: MimeType.CSV,
  pdf: MimeType.PDF,
  xlsx: MimeType.XLSX
};
