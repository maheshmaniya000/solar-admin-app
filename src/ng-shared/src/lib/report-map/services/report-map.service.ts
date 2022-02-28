import { HttpBackend, HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { REPORT_ASSETS_URL } from 'ng-shared/report-map/services/report-assets-url.factory';
import { AreaBBox } from 'ng-shared/report-map/types';

@Injectable()
export class ReportMapService {

  private readonly http: HttpClient;

  constructor(private readonly httpBackend: HttpBackend, @Inject(REPORT_ASSETS_URL) private readonly reportAssetsUrl: string) {
    this.http = new HttpClient(httpBackend);
  }

  getAreaBBoxes(): Observable<{[key: string]: AreaBBox}> {
    return this.http.get<{[key: string]: AreaBBox}>(`${this.reportAssetsUrl}/country-maps/bboxes.json`);
  }

}
