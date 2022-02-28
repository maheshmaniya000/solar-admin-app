import { InjectionToken } from '@angular/core';

import { HasReportConfig } from 'ng-shared/config';

export const REPORT_ASSETS_URL = new InjectionToken<string>('ReportAssetsUrl');

export function reportAssetsUrlFactory(config: HasReportConfig): string {
  return config.report.assetsUrl;
}
