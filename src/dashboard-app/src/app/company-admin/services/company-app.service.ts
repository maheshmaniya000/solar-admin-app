import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppSubscription, CompanyWithToken, SolargisApp } from '@solargis/types/user-company';

import { Config } from 'ng-shared/config';

@Injectable()
export class CompanyAppService {

  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  updateAppSubscription(
    sgCompanyId: string, app: SolargisApp, update: Pick<AppSubscription, 'assignedUsers'>
  ): Observable<CompanyWithToken> {
    return this.http.patch<CompanyWithToken>(
      `${this.config.api.customerUrl}/company/${sgCompanyId}/app/${app}/subscription`, update
    );
  }

}
