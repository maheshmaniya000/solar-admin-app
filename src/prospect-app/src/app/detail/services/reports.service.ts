import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { EnergySystemRef, getAppSystemId, keySeparator, Report } from '@solargis/types/project';

import { State } from 'ng-project/project/reducers';
import { Config } from 'ng-shared/config';
import { selectDateTimeFormat, selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { FUPHttpClientService } from 'ng-shared/fup/services/fup-http-client.service';

import { mimeTypeByReportType } from '../utils/report.utils';


@Injectable()
export class ReportsService {

  constructor(private readonly http: FUPHttpClientService, private readonly config: Config, private readonly store: Store<State>) {}

  listReports(ref: EnergySystemRef): Observable<Report[]> {
    const appSystemId = getAppSystemId(ref);
    return this.http
      .get(`${this.config.api.projectUrl}/${ref.projectId}/report/${appSystemId}`)
      .pipe(map(result => result && result.data));
  }

  createReport(ref: EnergySystemRef, reportType: string, lang: string, economy: boolean = false): Observable<void> {
    const appSystemId = getAppSystemId(ref);
    return combineLatest([this.store.pipe(selectUnitToggle), this.store.pipe(selectDateTimeFormat)]).pipe(
      first(),
      switchMap(([toggle, dateTimeFormat]) => this.http.put(
          `${this.config.api.projectUrl}/${ref.projectId}/report/${appSystemId}?economy=${!!economy}`,
          {toggle, locale: {dateFormat: dateTimeFormat.dateFormat}},
          {output: reportType, lang}
        )),
      map(() => null)
    );
  }

  downloadReport(report: Report, filename: string): Observable<any> {
    const appSystemId = getAppSystemId(report as EnergySystemRef);
    const langTemplateId = report.lang + keySeparator + report.templateId;

    return this.http.get(
      `${this.config.api.projectUrl}/${report.projectId}/report/${appSystemId}/${langTemplateId}/download`,
      // @ts-ignore
      { responseType: 'arraybuffer', headers: { accept: mimeTypeByReportType[report.type] }, params: { filename }}
    );
  }

  deleteReport(report: Report): Observable<void> {
    const appSystemId = getAppSystemId(report as EnergySystemRef);
    const langTemplateId = report.lang + keySeparator + report.templateId;
    return this.http
      .delete(`${this.config.api.projectUrl}/${report.projectId}/report/${appSystemId}/${langTemplateId}`)
      .pipe(map(() => null));
  }
}
